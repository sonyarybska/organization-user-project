import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { Reconnector } from 'src/types/Reconnector';
import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';
import { DBError } from 'src/types/errors/DBError';

export interface IUserOrganizationRepo
  extends Reconnector<IUserOrganizationRepo, TypeOrmConnection> {
  assignUserToOrganization(data: Partial<UserOrganizationEntity>): Promise<void>
}

export function getUserOrganizationRepo(db: DataSource | EntityManager) {
  const userOrganizationRepo = db.getRepository<UserOrganizationEntity>(
    UserOrganizationEntity
  );

  return {
    reconnect(conn: TypeOrmConnection): IUserOrganizationRepo {
      return getUserOrganizationRepo(conn.entityManager);
    },

    async assignUserToOrganization(
      data: Partial<UserOrganizationEntity>
    ): Promise<void> {
      try {
        await userOrganizationRepo
          .createQueryBuilder('user_organization')
          .insert()
          .values(data as Partial<UserOrganizationEntity>)
          .returning('*')
          .execute();
      } catch (error) {
        throw new DBError('Failed to assign user to organization', error);
      }
    }
  };
}
