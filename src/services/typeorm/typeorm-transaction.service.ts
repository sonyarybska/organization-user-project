import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { TransactionService } from 'src/types/TypeOrmTransactionService';
import { DataSource } from 'typeorm';

export function getTypeOrmTransactionService(
  db: DataSource
): TransactionService<TypeOrmConnection> {
  return {
    async run<T>(cb: (conn: TypeOrmConnection) => Promise<T>) {
      return await db.transaction((entityManager) => {
        const connection: TypeOrmConnection = {
          entityManager
        };

        return cb(connection);
      });
    }
  };
}
