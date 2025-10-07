import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

export type DeclineOrganizationInviteByAdminDto = {
  inviteId: string
  organizationId: string
  organizationInviteRepo: IOrganizationInviteRepo
  status:InviteStatus
}
