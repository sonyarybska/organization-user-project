import { ImportProspectsFromCsvDto } from 'src/types/dtos/prospect/ImportProspectFromCsvDto';
import { StartCsvImportMessage } from 'src/types/interfaces/StartCsvImportMessage';
import { parse } from 'csv-parse/sync';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const bucket = process.env.AWS_S3_BUCKET_NAME;
const queueUrl = process.env.AWS_SQS_START_CSV_IMPORT_QUEUE_URL;

export async function importProspectsFromCsv(data: ImportProspectsFromCsvDto) {
  const {
    s3Service,
    sqsService,
    csvImportRecordRepo,
    organizationId,
    userId,
    trackingContext,
    trackingService,
    prospectRepo,
    organizationRepo
  } = data;

  const rows = parse(data.buffer, {
    columns: true,
    skip_empty_lines: true
  });

  const { monthlyImportLimit } = await organizationRepo.getByIdAndUserId(organizationId, userId);
  const currentCount = await prospectRepo.countMonthlyByOrganizationId(data.organizationId);

  if (currentCount + rows.length > monthlyImportLimit) {
    throw new ApplicationError(
      `Monthly prospect limit exceeded. Current: ${currentCount}, attempting: ${rows.length}, limit: ${monthlyImportLimit}`
    );
  }

  const key = `csv-imports/${data.organizationId}/${data.userId}/${Date.now()}.csv`;

  await s3Service.upload(key, data.buffer, bucket);

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
    userEmail: data.userEmail,
    organizationId,
    trackingContext
  });

  return { csvImportRecordId: csvImportRecord.id };
}
