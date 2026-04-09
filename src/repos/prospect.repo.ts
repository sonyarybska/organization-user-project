import { ProspectEntity } from 'src/services/typeorm/entities/ProspectEntity';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { DataSource, EntityManager } from 'typeorm';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { Prospect } from 'src/types/Prospect';
import { DBError } from 'src/types/errors/DBError';

export interface IProspectRepo extends Reconnector<IProspectRepo, TypeOrmConnection> {
  create(prospect: Partial<Prospect>): Promise<Prospect>;
  getByOrganizationId(organizationId: string): Promise<{ prospects: Prospect[]; count: number }>;
  existsByEmailAndOrganizationId(email: string, organizationId: string): Promise<boolean>;
  getByIdAndOrganizationId(prospectId: string, organizationId: string): Promise<Prospect>;
  deleteByIdAndOrganizationId(prospectId: string, organizationId: string): Promise<void>;
  countMonthlyByOrganizationId(organizationId: string): Promise<number>;
}

export function getProspectRepo(db: DataSource | EntityManager): IProspectRepo {
  const prospectRepo = db.getRepository<ProspectEntity>(ProspectEntity);

  return {
    reconnect(connection: TypeOrmConnection) {
      return getProspectRepo(connection.entityManager);
    },

    async create(prospect: Partial<Prospect>): Promise<Prospect> {
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

        return result.raw[0] as Prospect;
      } catch (error) {
        throw new DBError('Failed to create prospect', error);
      }
    },

    async getByOrganizationId(organizationId: string): Promise<{ prospects: Prospect[]; count: number }> {
      try {
        const [prospects, count] = await prospectRepo
          .createQueryBuilder('prospect')
          .where('prospect.organizationId = :organizationId', { organizationId })
          .getManyAndCount();

        return { prospects: prospects as Prospect[], count };
      } catch (error) {
        throw new DBError(`Prospects for organization id ${organizationId} not found`, error);
      }
    },

    async existsByEmailAndOrganizationId(email: string, organizationId: string): Promise<boolean> {
      try {
        return await prospectRepo
          .createQueryBuilder('prospect')
          .where('prospect.email = :email', { email: email.toLowerCase() })
          .andWhere('prospect.organizationId = :organizationId', { organizationId })
          .getExists();
      } catch (error) {
        throw new DBError(`Failed to check if email exists for organization id ${organizationId}`, error);
      }
    },

    async getByIdAndOrganizationId(prospectId: string, organizationId: string): Promise<Prospect> {
      try {
        return (await prospectRepo.findOneOrFail({
          where: { id: prospectId, organizationId }
        })) as Prospect;
      } catch (error) {
        throw new DBError(`Prospect with id ${prospectId} not found`, error);
      }
    },
    async deleteByIdAndOrganizationId(prospectId: string, organizationId: string): Promise<void> {
      try {
        await prospectRepo.delete({ id: prospectId, organizationId });
      } catch (error) {
        throw new DBError(`Failed to delete prospect with id ${prospectId}`, error);
      }
    },

    async countMonthlyByOrganizationId(organizationId: string): Promise<number> {
      try {
        return await prospectRepo
          .createQueryBuilder('prospect')
          .where('prospect.organizationId = :organizationId', { organizationId })
          .andWhere("prospect.createdAt >= date_trunc('month', CURRENT_DATE)")
          .getCount();
      } catch (error) {
        throw new DBError(`Failed to count monthly prospects for organization ${organizationId}`, error);
      }
    }
  };
}
