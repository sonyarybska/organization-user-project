import { IOrganizationInvitationRepo } from 'src/repos/organization-invitation.repo';

export type GetOrganizationInvitations = {
  organizationId: string
  userId: string
  organizationInvitationRepo: IOrganizationInvitationRepo
}
