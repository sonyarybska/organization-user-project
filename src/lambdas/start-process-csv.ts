 /* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getAwsS3Service, IS3Service } from 'src/services/aws/s3/s3.service';
import { getAwsSqsService } from 'src/services/aws/sqs/sqs.service';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { getCsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { ImportCsvProspect, ImportCsvProspectSchema } from 'src/api/routes/organizations/prospects/csv-import-records/schemas/ImportCsvProspectSchema';
import { getProspectRepo } from 'src/repos/prospect.repo';

interface StartCsvImportMessage {
  importRecordId: string
  mapping: Record<string, any>
  userId: string
  organizationId: string
  key: string
}

const bucketName = process.env.AWS_S3_BUCKET_NAME;

async function getCsvStreamFromS3(s3: IS3Service, key: string, bucket: string) {
  const response = await s3.getFile(key, bucket);

  if (!response.Body) {
    throw new Error('File is empty');
  }

  const parser = parse({ columns: true, skip_empty_lines: true });
  return (response.Body as Readable).pipe(parser);
}

function mapAndValidateRow(
  row: Record<string, any>,
  mapping: Record<string, any>,
  userId: string,
  organizationId: string,
  rowNumber: number
) {
  const mappedRow: Partial<ImportCsvProspect> = Object.fromEntries(
    Object.entries(mapping).map(([target, source]) => [target, row[source]])
  );

  const result = ImportCsvProspectSchema.safeParse({
    ...mappedRow,
    salary: mappedRow.salary ? Number(mappedRow.salary) : null
  });

  if (!result.success) {
    throw new Error(
      `Row ${rowNumber} validation failed: ${result.error.message}`
    );
  }

  return { ...result.data, userId,organizationId };
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!event.Records.length) {
    return;
  }

  const db = await getDb({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    dbName: process.env.PGDATABASE,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD
  });

  const repo = getCsvImportRecordRepo(db);
  const prospectRepo = getProspectRepo(db);
  const s3 = getAwsS3Service(process.env.AWS_REGION);
  const sqs = getAwsSqsService(process.env.AWS_REGION);

  for (const record of event.Records) {
    const { importRecordId, key, mapping, organizationId, userId } = JSON.parse(
      record.body
    ) as StartCsvImportMessage;

    try {
      if (!importRecordId || !key || !mapping || !userId || !organizationId) {
        throw new Error('Missing required fields in the message');
      }

      await repo.update(importRecordId, {
        status: CsvImportStatusEnum.BUSY,
        processedRows: 0,
        failedRows: 0,
        skippedDuplicationRows: 0
      });

      const existingEmails = await prospectRepo.getEmailsByOrganizationId(organizationId);

      const existingEmailsSet = new Set(existingEmails);

      const stream = await getCsvStreamFromS3(s3, key, bucketName);

      let rowNumber = 0;
      let skippedCount = 0;
      const seenEmails = new Set<string>();

      for await (const row of stream) {
        rowNumber++;

        const prospect = mapAndValidateRow(row, mapping, userId, organizationId, rowNumber);

        const email = prospect.email.toLowerCase();

        if (seenEmails.has(email) || existingEmailsSet.has(email)) {
          console.log('Duplicate email found, skipping:', email);
          skippedCount++;
          continue;
        }

        seenEmails.add(email);

        await sqs.sendMessageToQueue(
          process.env.AWS_SQS_PROCESS_CSV_ROW_QUEUE_URL,
          {
            importRecordId,
            row: prospect
          }
        );
      }

      if (skippedCount > 0) {
        await repo.update(importRecordId, {
          skippedDuplicationRows: skippedCount
        });
      }

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
 
      await repo.update(importRecordId, {
        status: CsvImportStatusEnum.ERROR,
        lastError: errorMessage
      });

      console.error('Error processing CSV import:', errorMessage);
    }
  }
};
