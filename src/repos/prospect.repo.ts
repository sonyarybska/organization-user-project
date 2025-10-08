import { ProspectEntity } from 'src/services/typeorm/entities/ProspectEntity';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { DataSource, EntityManager } from 'typeorm';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { Prospect } from 'src/types/Prospect';
import { DBError } from 'src/types/errors/DBError';

export interface IProspectRepo
  extends Reconnector<IProspectRepo, TypeOrmConnection> {
  create(prospect: Partial<Prospect>): Promise<Prospect>
  getByOrganizationId(organizationId: string): Promise<Prospect[]>
  getByIdAndOrganizationId(
    prospectId: string,
    organizationId: string,
  ): Promise<Prospect>
}

export function getProspectRepo(db: DataSource | EntityManager): IProspectRepo {
  const prospectRepo = db.getRepository<ProspectEntity>(ProspectEntity);

  return {
    reconnect(connection: TypeOrmConnection) {
      return getProspectRepo(connection.entityManager);
    },

    async create(prospect: Partial<Prospect>): Promise<ProspectEntity> {
      try {
        const result = await prospectRepo
          .createQueryBuilder()
          .insert()
          .values(prospect as Partial<ProspectEntity>)
          .returning('*')
          .execute();

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create prospect', error);
      }
    },
    async getByOrganizationId(
      organizationId: string
    ): Promise<ProspectEntity[]> {
      try {
        return await prospectRepo.find({
          where: { organizationId }
        });
      } catch (error) {
        throw new DBError(
          `Prospects for organization id ${organizationId} not found`,
          error
        );
      }
    },
    async getByIdAndOrganizationId(
      prospectId: string,
      organizationId: string
    ): Promise<ProspectEntity> {
      try {
        return await prospectRepo.findOneOrFail({
          where: { id: prospectId, organizationId }
        });
      } catch (error) {
        throw new DBError(`Prospect with id ${prospectId} not found`, error);
      }
    }
  };
}
