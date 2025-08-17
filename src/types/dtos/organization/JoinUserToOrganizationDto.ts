import { IOrganizationInvitationRepo } from 'src/repos/organization-invitation.repo';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';

export type JoinUserToOrganizationDto = {
  invitationId: string
  userOrganizationRepo: IUserOrganizationRepo
  organizationInvitationRepo: IOrganizationInvitationRepo
  userId: string
  email: string
}
