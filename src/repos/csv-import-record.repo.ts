import { CsvImportRecordEntity } from 'src/services/typeorm/entities/CsvImportRecordEntity';
import { CsvImportRecord } from 'src/types/CsvImportRecord';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { DBError } from 'src/types/errors/DBError';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';

export interface ICsvImportRecordRepo
  extends Reconnector<ICsvImportRecordRepo, TypeOrmConnection> {
  getById(id: string): Promise<CsvImportRecord>
  create(data: Partial<CsvImportRecordEntity>): Promise<CsvImportRecord>
  update(id: string, data: Partial<CsvImportRecord>): Promise<CsvImportRecord>
  incrementProcessedRows(id: string): Promise<void>
  incrementSkippedDuplicationRows(id: string): Promise<void>
  handleImportError(id: string, lastError: string): Promise<void>
  checkIfDone(id: string): Promise<boolean>
}

export function getCsvImportRecordRepo(
  db: DataSource | EntityManager
): ICsvImportRecordRepo {
  const csvImportRecord = db.getRepository<CsvImportRecordEntity>(
    CsvImportRecordEntity
  );

  return {
    reconnect(connection: TypeOrmConnection): ICsvImportRecordRepo {
      return getCsvImportRecordRepo(connection.entityManager);
    },

    async getById(id: string): Promise<CsvImportRecord> {
      try {
        return await csvImportRecord.findOneByOrFail({ id });
      } catch (error) {
        throw new DBError(
          `Failed to get csv import record with id ${id}`,
          error
        );
      }
    },

    async create(data: Partial<CsvImportRecord>): Promise<CsvImportRecord> {
      try {
        const result = await csvImportRecord
          .createQueryBuilder('csvImportRecord')
          .insert()
          .values(data as CsvImportRecordEntity)
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError('Failed to create csv import record');
        }

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create csv import record', error);
      }
    },
    async update(
      id: string,
      data: Partial<CsvImportRecord>
    ): Promise<CsvImportRecord> {
      try {
        const result = await csvImportRecord
          .createQueryBuilder('csvImportRecord')
          .update(CsvImportRecordEntity)
          .set(data as Partial<CsvImportRecordEntity>)
          .where('id = :id', { id })
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError(`Failed to update csv import record with id ${id}`);
        }

        return result.raw[0];
      } catch (error) {
        throw new DBError(
          `Failed to update csv import record with id ${id}`,
          error
        );
      }
    },

    async incrementProcessedRows(id: string): Promise<void> {
      try {
        await csvImportRecord
          .createQueryBuilder()
          .update(CsvImportRecordEntity)
          .set({ processedRows: () => 'COALESCE("processedRows",0)+1' })
          .where('id = :id', { id })
          .execute();
      } catch (error) {
        throw new DBError(
          `Failed to increase processedRows for csv import record with id ${id}`,
          error
        );
      }
    },

    async incrementSkippedDuplicationRows(id: string): Promise<void> {
      try {
        await csvImportRecord
          .createQueryBuilder()
          .update(CsvImportRecordEntity)
          .set({
            skippedDuplicationRows: () =>
              'COALESCE("skippedDuplicationRows",0)+1'
          })
          .where('id = :id', { id })
          .execute();
      } catch (error) {
        throw new DBError(
          `Failed to increase skippedDuplicationRows for csv import record with id ${id}`,
          error
        );
      }
    },

    async handleImportError(id: string, lastError: string): Promise<void> {
      try {
        await csvImportRecord
          .createQueryBuilder()
          .update(CsvImportRecordEntity)
          .set({
            failedRows: () => 'COALESCE("failedRows",0)+1',
            status: CsvImportStatusEnum.ERROR,
            lastError
          })
          .where('id = :id', { id })
          .execute();
      } catch (error) {
        throw new DBError(
          `Failed to handle import error for csv import record with id ${id}`,
          error
        );
      }
    },

    checkIfDone(id: string): Promise<boolean> {
      try {
        return csvImportRecord
          .createQueryBuilder('csvImportRecord')
          .where('id = :id', { id })
          .andWhere('"totalRows" IS NOT NULL')
          .andWhere('"totalRows" > 0')
          .andWhere(
            'COALESCE("processedRows", 0) + COALESCE("failedRows", 0) + COALESCE("skippedDuplicationRows", 0) >= "totalRows"'
          )
          .getCount()
          .then((count) => count > 0);
      } catch (error) {
        throw new DBError(
          `Failed to check if csv import record with id ${id} is done`,
          error
        );
      }
    }
  };
}
