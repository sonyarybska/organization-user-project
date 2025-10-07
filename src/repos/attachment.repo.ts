import { AttachmentEntity } from 'src/services/typeorm/entities/AttachmentEntity';
import { Attachment } from 'src/types/Attachment';
import { DBError } from 'src/types/errors/DBError';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';

export interface IAttachmentRepo
  extends Reconnector<IAttachmentRepo, TypeOrmConnection> {
  create(data: Partial<AttachmentEntity>): Promise<Attachment>
}

export function getAttachmentRepo(
  db: DataSource | EntityManager
): IAttachmentRepo {
  const attachmentRepo = db.getRepository<AttachmentEntity>(AttachmentEntity);

  return {
    reconnect(connection: TypeOrmConnection): IAttachmentRepo {
      return getAttachmentRepo(connection.entityManager);
    },

    async create(
      data: Partial<AttachmentEntity>
    ): Promise<AttachmentEntity> {
      try {
        const result = await attachmentRepo
          .createQueryBuilder('attachment')
          .insert()
          .into(AttachmentEntity)
          .values(data as AttachmentEntity)
          .returning('*')
          .execute();

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create attachment', error);
      }
    }
  };
}
