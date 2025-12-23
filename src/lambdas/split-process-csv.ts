/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getProspectRepo } from 'src/repos/prospect.repo';
import { getCsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { Prospect } from 'src/types/Prospect';
import { getTypeOrmTransactionService } from 'src/services/typeorm/typeorm-transaction.service';
import { ProspectSourceEnum } from 'src/types/enums/ProspectSourceEnum';

interface ProcessCsvRowMessage {
  importRecordId: string
  row: Partial<Prospect>
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

  const transactionService = getTypeOrmTransactionService(db);

  const prospectRepo = getProspectRepo(db);
  const importRepo = getCsvImportRecordRepo(db);

  for (const record of event.Records) {
    const { importRecordId, row } = JSON.parse(
      record.body
    ) as ProcessCsvRowMessage;

    try {
      if (!importRecordId || !row) {
        throw new Error('Missing required fields in the message');
      }
      const { status } = await importRepo.getById(importRecordId);

      if (status !== CsvImportStatusEnum.BUSY) {
        console.log(
          `Skipping processing for importRecordId ${importRecordId} with status ${status}`
        );
        continue;
      }

      await transactionService.run(async (connection) => {
        const prospectRepoTx = prospectRepo.reconnect(connection);
        const importRepoTx = importRepo.reconnect(connection);

        await prospectRepoTx.create({ ...row, source:ProspectSourceEnum.CSV_IMPORT });

        await importRepoTx.incrementProcessedRows(importRecordId);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await importRepo.handleImportError(importRecordId, errorMessage);
      
      console.log('Error processing row for importRecordId');
    } finally {
      const isDone = await importRepo.checkIfDone(importRecordId);

      if (isDone) {
        await importRepo.update(importRecordId, {
          status: CsvImportStatusEnum.DONE
        });
      }
    }
  }
};
