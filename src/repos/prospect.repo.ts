import { ProspectEntity } from 'src/services/typeorm/entities/ProspectEntity';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { DataSource, EntityManager } from 'typeorm';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { Prospect } from 'src/types/Prospect';
import { DBError } from 'src/types/errors/DBError';

export interface IProspectRepo
  extends Reconnector<IProspectRepo, TypeOrmConnection> {
  create(prospect: Partial<Prospect>): Promise<Prospect>
  getByOrganizationId(organizationId: string): Promise<{prospects: Prospect[], count: number}>
  getByIdAndOrganizationId(
    prospectId: string,
    organizationId: string,
  ): Promise<Prospect>
  deleteByIdAndOrganizationId(
    prospectId: string,
    organizationId: string,
  ): Promise<void>
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

        if (!result.raw[0]) {
          throw new DBError('Failed to create prospect');
        }

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create prospect', error);
      }
    },

    async getByOrganizationId(
      organizationId: string
    ): Promise<{prospects: ProspectEntity[], count: number}> {
      try {
        const [prospects, count] = await prospectRepo.createQueryBuilder('prospect')
          .where('prospect.organizationId = :organizationId', { organizationId })
          .getManyAndCount();

        return { prospects, count };
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
    },
    async deleteByIdAndOrganizationId(
      prospectId: string,
      organizationId: string
    ): Promise<void> {
      try {
        await prospectRepo.delete({ id: prospectId, organizationId });
      } catch (error) {
        throw new DBError(`Failed to delete prospect with id ${prospectId}`, error);
      }
    }
  };
}
