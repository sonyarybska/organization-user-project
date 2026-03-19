/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getProspectRepo } from 'src/repos/prospect.repo';
import { getCompanyRepo } from 'src/repos/company.repo';
import { getCsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { getTypeOrmTransactionService } from 'src/services/typeorm/typeorm-transaction.service';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { normalizeDomain, normalizeLinkedinUrl, normalizePhoneNumber } from 'src/api/helpers/normalization';
import { getAwsSqsService } from 'src/services/aws/sqs/sqs.service';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { CreateTrackingEventDto } from 'src/types/dtos/tracking/CreateTrackingEventDto';
import { ProcessProspectCsvRowMessageDto } from 'src/types/dtos/prospect/ProcessProspectCsvRowMessageDto';

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

  const transactionService = getTypeOrmTransactionService(db);

  const prospectRepo = getProspectRepo(db);
  const companyRepo = getCompanyRepo(db);
  const importRepo = getCsvImportRecordRepo(db);
  const sqs = getAwsSqsService(process.env.AWS_REGION);

  for (const record of event.Records) {
    const { importRecordId, row, isDuplicate } = JSON.parse(record.body) as ProcessProspectCsvRowMessageDto;

    try {
      if (!importRecordId || !row) {
        throw new Error('Missing required fields in the message');
      }
      const { status } = await importRepo.getById(importRecordId);

      if (status !== CsvImportStatusEnum.BUSY) {
        console.log(`Skipping processing for importRecordId ${importRecordId} with status ${status}`);
        continue;
      }
      if (isDuplicate) {
        console.log('Duplicate email found in database, skipping:', row.email);
        await importRepo.incrementSkippedRows(importRecordId);
        continue;
      }

      const emailExists = await prospectRepo.existsByEmailAndOrganizationId(row.email!.toLowerCase(), row.organizationId!);

      if (emailExists) {
        console.log('Duplicate email found in database, skipping:', row.email);
        await importRepo.incrementSkippedRows(importRecordId);
        continue;
      }

      await transactionService.run(async (connection) => {
        const prospectRepoTx = prospectRepo.reconnect(connection);
        const companyRepoTx = companyRepo.reconnect(connection);
        const importRepoTx = importRepo.reconnect(connection);

        const { companyName, companyAddress, companyLinkedinUrl, ...prospectData } = row;

        const normalizedDomain = normalizeDomain(prospectData.domain!);
        const normalizedCompanyLinkedinUrl = normalizeLinkedinUrl(companyLinkedinUrl);

        const company = await companyRepoTx.upsert({
          domain: normalizedDomain,
          source: SourceTypeEnum.CSV_IMPORT,
          linkedinUrl: normalizedCompanyLinkedinUrl,
          name: companyName,
          address: companyAddress,
          organizationId: prospectData.organizationId!
        });

        const normalizedProspectLinkedinUrl = normalizeLinkedinUrl(prospectData.linkedinUrl);
        const normalizedPhone = normalizePhoneNumber(prospectData.phone);

        await prospectRepoTx.create({
          ...prospectData,
          linkedinUrl: normalizedProspectLinkedinUrl,
          phone: normalizedPhone,
          companyId: company.id,
          source: SourceTypeEnum.CSV_IMPORT
        });

        await importRepoTx.incrementProcessedRows(importRecordId);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await importRepo.handleImportError(importRecordId, errorMessage);

      console.log('Error processing row for importRecordId', importRecordId, ':', errorMessage);
    } finally {
      const isDone = await importRepo.checkIfDone(importRecordId);

      if (isDone) {
        const importRecord = await importRepo.getById(importRecordId);

        await importRepo.update(importRecordId, {
          status: CsvImportStatusEnum.DONE
        });

        await sqs.sendMessageToQueue<CreateTrackingEventDto>(process.env.AWS_SQS_TRACKING_QUEUE_URL, {
          eventType: EventTypeEnum.CsvImportCompleted,
          ipAddress: null,
          userAgent: null,
          organizationId: importRecord.organizationId,
          userId: importRecord.userId,
          resourceType: EventResourceTypeEnum.CsvImport,
          resourceId: importRecordId
        });
      }
    }
  }
};
