import { IOrganizationInvitationRepo } from 'src/repos/organization-invitation.repo';
import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IUserRepo } from 'src/repos/user-repo';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';

export type CreateOrganizationInvitationDto = {
  email: string
  organizationId: string
  userId: string
  sendGridService: ISendGridService
  organizationInvitationRepo: IOrganizationInvitationRepo
  organizationRepo: IOrganizationRepo
  userRepo: IUserRepo
  inviteTokenExpireInMillis: number
}
