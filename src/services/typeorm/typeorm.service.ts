import { DataSource } from 'typeorm';
import { UserEntity } from './entities/UserEntity';
import { OrganizationEntity } from './entities/OrganizationEntity';
import { UserOrganizationEntity } from './entities/UserOrganizationEntity';
import { OrganizationInviteEntity } from './entities/OrganizationInviteEntity';
import { AttachmentEntity } from './entities/AttachmentEntity';
import { ProspectEntity } from './entities/ProspectEntity';
import { CsvImportRecordEntity } from './entities/CsvImportRecordEntity';

export function getDataSource(opts: {
  host: string
  port: number
  dbName: string
  user: string
  password: string
  migrations?: string[]
}) {
  return new DataSource({
    type: 'postgres',
    host: opts.host,
    port: opts.port,
    username: opts.user,
    password: opts.password,
    database: opts.dbName,
    synchronize: false,
    logging: process.env.NODE_ENV === 'local',
    migrations: opts.migrations,
    ssl: { rejectUnauthorized: false },
    entities: [
      UserEntity,
      OrganizationEntity,
      UserOrganizationEntity,
      OrganizationInviteEntity,
      AttachmentEntity,
      ProspectEntity,
      CsvImportRecordEntity
    ]
  });
}

export function getDb(opts: {
  host: string
  port: number
  dbName: string
  user: string
  password: string
}) {
  return getDataSource(opts).initialize();
}
