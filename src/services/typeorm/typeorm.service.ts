import { DataSource } from 'typeorm';
import { UserEntity } from './entities/UserEntity';
import { OrganizationEntity } from './entities/OrganizationEntity';
import { UserOrganizationEntity } from './entities/UserOrganizationEntity';
import { OrganizationInvitationEntity } from './entities/OrganizationInvitationEntity';
import { AttachmentEntity } from './entities/AttachmentEntity';

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
    entities: [
      UserEntity,
      OrganizationEntity,
      UserOrganizationEntity,
      OrganizationInvitationEntity,
      AttachmentEntity
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
