import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';

export type GetOrganizationInvitesDto = {
  organizationId: string
  organizationInviteRepo: IOrganizationInviteRepo
}
