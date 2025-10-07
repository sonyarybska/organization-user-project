import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { IHMACService } from 'src/services/hmac/hmac.service';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

export type DeclineOrganizationInviteDto = {
  token: string
  organizationInviteRepo: IOrganizationInviteRepo
  status:InviteStatus
  hmacService: IHMACService
}
