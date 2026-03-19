import { ImportProspectsFromCsvDto } from 'src/types/dtos/prospect/ImportProspectFromCsvDto';
import { StartCsvImportMessage } from 'src/types/interfaces/StartCsvImportMessage';
import { parse } from 'csv-parse/sync';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

const bucket = process.env.AWS_S3_BUCKET_NAME;
const queueUrl = process.env.AWS_SQS_START_CSV_IMPORT_QUEUE_URL;

export async function importProspectsFromCsv(data: ImportProspectsFromCsvDto) {
  const { s3Service, sqsService, trackingService, csvImportRecordRepo, userId, organizationId, trackingContext } = data;

  const key = `csv-imports/${organizationId}/${userId}/${Date.now()}.csv`;

  await s3Service.upload(key, data.buffer, bucket);

  const rows = parse(data.buffer, {
    columns: true,
    skip_empty_lines: true
  });

  const csvImportRecord = await csvImportRecordRepo.create({
    key,
    organizationId,
    status: CsvImportStatusEnum.NEW,
    userId,
    totalRows: rows.length
  });

  await sqsService.sendMessageToQueue<StartCsvImportMessage>(queueUrl, {
    importRecordId: csvImportRecord.id,
    mapping: data.mapping,
    userId,
    organizationId,
    key
  });

  trackingService.track({
    eventType: EventTypeEnum.CsvImportStarted,
    resourceType: EventResourceTypeEnum.CsvImport,
    resourceId: csvImportRecord.id,
    userId,
    organizationId,
    trackingContext
  });

  return { csvImportRecordId: csvImportRecord.id };
}
