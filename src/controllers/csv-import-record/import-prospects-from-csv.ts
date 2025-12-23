import { ImportProspectsFromCsvDto } from 'src/types/dtos/prospect/ImportProspectFromCsvDto';
import { StartCsvImportMessage } from 'src/types/interfaces/StartCsvImportMessage';
import { parse } from 'csv-parse/sync';

const bucket = process.env.AWS_S3_BUCKET_NAME;
const queueUrl = process.env.AWS_SQS_START_CSV_IMPORT_QUEUE_URL;

export async function importProspectsFromCsv(data: ImportProspectsFromCsvDto) {
  const { s3Service, sqsService, csvImportRecordRepo } = data;

  const key = `csv-imports/${data.organizationId}/${data.userId}/${Date.now()}.csv`;

  await s3Service.upload(key, data.buffer, bucket);

  const rows = parse(data.buffer, {
    columns: true,
    skip_empty_lines: true
  });

  const csvImportRecord = await csvImportRecordRepo.create({
    key,
    organizationId: data.organizationId,
    userId: data.userId,
    totalRows: rows.length
  });

  await sqsService.sendMessageToQueue(queueUrl, {
    importRecordId: csvImportRecord.id,
    mapping: data.mapping,
    userId: data.userId,
    organizationId: data.organizationId,
    key
  } as StartCsvImportMessage);

  return { csvImportRecordId: csvImportRecord.id };
}
