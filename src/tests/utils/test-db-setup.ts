/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { getDataSource } from 'src/services/typeorm/typeorm.service';

let dataSource: DataSource | null = null;

export async function setupTestDatabase() {
  if (!dataSource) {
    dataSource = getDataSource({
      host: process.env.TESTPGHOST,
      port: parseInt(process.env.TESTPGPORT, 10),
      dbName: process.env.TESTPGDATABASE,
      user: process.env.TESTPGUSERNAME,
      password: process.env.TESTPGPASSWORD
    });

    await dataSource.initialize();
    await dataSource.synchronize();
  }

  return dataSource!;
}

export async function teardownTestDatabase() {
  if (dataSource) {
    try {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    } catch (error) {
      console.error('Error destroying dataSource:', error);
    } finally {
      dataSource = null;
    }
  }
}

export async function clearDatabase() {
  if (!dataSource) {return;}

  const tableNames = dataSource.entityMetadatas
    .map(m => `"${m.tableName}"`)
    .join(', ');

  if (!tableNames) {return;}

  await dataSource.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`
  );
}

export function getTestDataSource() {
  return dataSource!;
}
