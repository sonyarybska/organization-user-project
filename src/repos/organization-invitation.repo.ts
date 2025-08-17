import { OrganizationInvitationEntity } from 'src/services/typeorm/entities/OrganizationInvitationEntity';
import { DBError } from 'src/types/errors/DBError';
import { OrganizationInvitation } from 'src/types/OrganizationInvitation';
import { Reconnector } from 'src/types/Reconnector';
import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';

export interface IOrganizationInvitationRepo
  extends Reconnector<IOrganizationInvitationRepo, TypeOrmConnection> {
  createInvite(
    data: Partial<OrganizationInvitation>,
  ): Promise<OrganizationInvitation>
  update(
    id: string,
    data: Partial<OrganizationInvitation>,
  ): Promise<OrganizationInvitation>
  getByIdAndEmail(id: string, email: string): Promise<OrganizationInvitation>
  getAllByOrganizationIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationInvitation[]>
}

export function getOrganizationInvitationRepo(db: DataSource | EntityManager) {
  const organizationInvitationRepo =
    db.getRepository<OrganizationInvitationEntity>(OrganizationInvitationEntity);

  return {
    reconnect(connection: TypeOrmConnection): IOrganizationInvitationRepo {
      return getOrganizationInvitationRepo(connection.entityManager);
    },

    async createInvite(
      data: Partial<OrganizationInvitation>
    ): Promise<OrganizationInvitation> {
      try {
        const result = await organizationInvitationRepo
          .createQueryBuilder('invitation')
          .insert()
          .into(OrganizationInvitationEntity)
          .values(data as OrganizationInvitationEntity)
          .returning('*')
          .execute();

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create organization invitation', error);
      }
    },

    async update(
      id: string,
      data: Partial<OrganizationInvitation>
    ): Promise<OrganizationInvitation> {
      try {
        const result = await organizationInvitationRepo
          .createQueryBuilder('invitation')
          .update(OrganizationInvitationEntity)
          .set(data as OrganizationInvitationEntity)
          .where('id = :id', { id })
          .returning('*')
          .execute();

        return result.raw[0];
      } catch (error) {
        throw new DBError(
          `Failed to update organization invitation with id ${id}`,
          error
        );
      }
    },

    async getByIdAndEmail(
      id: string,
      email: string
    ): Promise<OrganizationInvitation> {
      try {
        return await organizationInvitationRepo.findOneOrFail({
          where: { id, email }
        });
      } catch (error) {
        throw new DBError(
          `Invitation with id ${id} and email ${email} not found`,
          error
        );
      }
    },

    async getAllByOrganizationIdAndUserId(
      organizationId: string,
      userId: string
    ): Promise<OrganizationInvitation[]> {
      try {
        return await organizationInvitationRepo.find({
          where: {
            organizationId,
            organization: { userOrganizations: { userId } }
          }
        });
      } catch (error) {
        throw new DBError(
          'Failed to retrieve invitations for organization',
          error
        );
      }
    }
  };
}
