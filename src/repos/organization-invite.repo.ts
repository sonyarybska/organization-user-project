import { OrganizationInviteEntity } from 'src/services/typeorm/entities/OrganizationInviteEntity';
import { DBError } from 'src/types/errors/DBError';
import { OrganizationInvite } from 'src/types/OrganizationInvite';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

export interface IOrganizationInviteRepo
  extends Reconnector<IOrganizationInviteRepo, TypeOrmConnection> {
  createInvite(
    data: Partial<OrganizationInvite>,
  ): Promise<OrganizationInvite>
  updateStatusById(
    id: string,
    status: InviteStatus
  ): Promise<OrganizationInvite>
  getByToken(id: string): Promise<OrganizationInvite>
  getByIdAndOrganizationId(
    id: string,
    organizationId: string
  ): Promise<OrganizationInvite>
  getByOrganizationId(
    organizationId: string
  ): Promise<OrganizationInvite[]>
  getByEmail(email: string): Promise<OrganizationInvite[]>
}

export function getOrganizationInviteRepo(db: DataSource | EntityManager): IOrganizationInviteRepo {
  const organizationInviteRepo =
    db.getRepository<OrganizationInviteEntity>(OrganizationInviteEntity);

  return {
    reconnect(connection: TypeOrmConnection): IOrganizationInviteRepo {
      return getOrganizationInviteRepo(connection.entityManager);
    },

    async createInvite(
      data: Partial<OrganizationInvite>
    ): Promise<OrganizationInvite> {
      try {
        const result = await organizationInviteRepo
          .createQueryBuilder('invite')
          .insert()
          .values(data as OrganizationInviteEntity)
          .returning('*')
          .execute();

        // make sure the first element exists
        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create organization invite', error);
      }
    },

    async updateStatusById(
      id: string,
      status: InviteStatus
    ): Promise<OrganizationInvite> {
      try {
        const result = await organizationInviteRepo
          .createQueryBuilder('invite')
          .update(OrganizationInviteEntity)
          .set({ status })
          .where('id = :id', { id })
          .andWhere('status = :currentStatus', { currentStatus: InviteStatus.PENDING })
          .returning('*')
          .execute();
        // make sure the first element exists
        return result.raw[0];
      } catch (error) {
        throw new DBError(
          `Failed to update organization invite with id ${id}`,
          error
        );
      }
    },

    async getByToken(
      token: string
    ): Promise<OrganizationInvite> {
      try {
        return await organizationInviteRepo.findOneOrFail({
          where: { token }
        });
      } catch (error) {
        throw new DBError(
          `Invite with token ${token} not found`,
          error
        );
      }
    },

    async getByIdAndOrganizationId(
      id: string,
      organizationId: string
    ): Promise<OrganizationInvite> {
      try {
        return await organizationInviteRepo.findOneOrFail({
          where: { id, organizationId }
        });
      } catch (error) {
        throw new DBError(
          `Invite with id ${id} and organizationId ${organizationId} not found`,
          error
        );
      }
    },

    async getByOrganizationId(
      organizationId: string
    ): Promise<OrganizationInvite[]> {
      try {
        return await organizationInviteRepo.find({
          where: {
            organizationId
          }
        });
      } catch (error) {
        throw new DBError(
          'Failed to retrieve invites for organization',
          error
        );
      }
    },

    async getByEmail(email: string): Promise<OrganizationInvite[]> {
      try {
        return await organizationInviteRepo.find({
          where: {
            email
          }
        });
      } catch (error) {
        throw new DBError(
          'Failed to retrieve invites for user',
          error
        );
      }
    }
  };
}
