import { DBError } from 'src/types/errors/DBError';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';
import { CompanyEntity } from 'src/services/typeorm/entities/CompanyEntity';
import { Company } from 'src/types/Company';

export interface ICompanyRepo
  extends Reconnector<ICompanyRepo, TypeOrmConnection> {
  create(data: Partial<Company>): Promise<Company>
  upsert(data: Partial<Company>): Promise<Company>
  getByIdAndOrganizationId(
    companyId: string,
    organizationId: string
  ): Promise<Company>
  updateByIdAndOrganizationId(
    companyId: string,
    organizationId: string,
    companyData: Partial<Company>
  ): Promise<void>
  deleteByIdAndOrganizationId(
    companyId: string,
    organizationId: string
  ): Promise<void>
}

export function getCompanyRepo(db: DataSource | EntityManager): ICompanyRepo {
  const companyRepo = db.getRepository<CompanyEntity>(CompanyEntity);

  return {
    reconnect(connection: TypeOrmConnection): ICompanyRepo {
      return getCompanyRepo(connection.entityManager);
    },

    async create(data: Partial<Company>): Promise<Company> {
      try {
        const result = await companyRepo
          .createQueryBuilder()
          .insert()
          .into(CompanyEntity)
          .values(data as CompanyEntity)
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError('Failed to create company');
        }

        return result.raw[0] as Company;
      } catch (error) {
        throw new DBError('Failed to create company', error);
      }
    },

    async upsert(data: Partial<Company>): Promise<Company> {
      try {
        const result = await companyRepo
          .createQueryBuilder()
          .insert()
          .into(CompanyEntity)
          .values(data as CompanyEntity)
          .orUpdate(
            ['linkedinUrl', 'name', 'address', 'updatedAt'],
            ['domain', 'organizationId'],
            {
              skipUpdateIfNoValuesChanged: true,
              upsertType: 'on-conflict-do-update'
            }
          )
          .returning('*')
          .execute();

          if (!result.raw[0]) {
          throw new DBError('Failed to upsert company');
        }

        return result.raw[0];
      } catch (err) {
        throw new DBError('Failed to upsert company', err);
      }
    },

    async getByIdAndOrganizationId(
      companyId: string,
      organizationId: string
    ): Promise<Company> {
      try {
        const result = await companyRepo.findOneOrFail({
          where: { id: companyId, organizationId }
        });

        return result;
      } catch (error) {
        throw new DBError(
          `Company with id ${companyId} not found for organization ${organizationId}`,
          error
        );
      }
    },

    async updateByIdAndOrganizationId(
      companyId: string,
      organizationId: string,
      companyData: Partial<Company>
    ): Promise<void> {
      try {
      await companyRepo.update(
          { id: companyId, organizationId },
          companyData as any
        );
   
      } catch (error) {
        throw new DBError(
          `Failed to update company with id ${companyId}`,
          error
        );
      }
    },

    async deleteByIdAndOrganizationId(
      companyId: string,
      organizationId: string
    ): Promise<void> {
      try {
      await companyRepo.delete({
          id: companyId,
          organizationId
        });
      } catch (error) {
        throw new DBError(
          `Failed to delete company with id ${companyId}`,
          error
        );
      }
    }
  };
}
