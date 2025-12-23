import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { ErrorCode } from 'src/types/enums/ErrorCodesEnum';
import { DBDuplicateError } from 'src/types/errors/DBDuplicateError';
import { DBError } from 'src/types/errors/DBError';
import { Organization } from 'src/types/Organization';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';

export interface IOrganizationRepo
  extends Reconnector<IOrganizationRepo, TypeOrmConnection> {
  create(organization: Partial<Organization>): Promise<Organization>
  getByIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<Organization>
  getByUserId(userId: string): Promise<Organization[]>
}

export function getOrganizationRepo(
  db: DataSource | EntityManager
): IOrganizationRepo {
  const organizationRepo =
    db.getRepository<OrganizationEntity>(OrganizationEntity);

  return {
    reconnect(connection: TypeOrmConnection): IOrganizationRepo {
      return getOrganizationRepo(connection.entityManager);
    },

    async getByUserId(userId: string): Promise<OrganizationEntity[]> {
      try {
        return await organizationRepo.find({
          where: { userOrganizations: { userId } }
        });
      } catch (error) {
        throw new DBError(
          `Organizations for user with id ${userId} not found`,
          error
        );
      }
    },

    async getByIdAndUserId(
      organizationId: string,
      userId: string
    ): Promise<OrganizationEntity> {
      try {
        return await organizationRepo.findOneOrFail({
          where: { id: organizationId, userOrganizations: { userId } },
          relations: ['userOrganizations', 'userOrganizations.user']
        });
      } catch (error) {
        throw new DBError(
          `Organization with id ${organizationId} not found`,
          error
        );
      }
    },

    async create(
      organization: Partial<Organization>
    ): Promise<OrganizationEntity> {
      try {
        const result = await organizationRepo
          .createQueryBuilder()
          .insert()
          .values(organization as Partial<OrganizationEntity>)
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError('Failed to create organization');
        }
        
        return result.raw[0];
      } catch (error) {
        if (error instanceof QueryFailedError) {
          if (
            error.message.includes(
              'duplicate key value violates unique constraint'
            )
          ) {
            throw new DBDuplicateError(
              'Organization',
              error,
              ErrorCode.DB_ITEM_DUPLICATE
            );
          }
        }
        throw new DBError('Failed to create organization', error);
      }
    }
  };
}
