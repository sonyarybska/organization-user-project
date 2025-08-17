import { IOrganizationInvitationRepo } from 'src/repos/organization-invitation.repo';
import { InviteStatus } from 'src/types/enums/InviteStatusEnums';

export async function declineOrganizationInvite(
  organizationInvitationId: string,
  organizationInvitationRepo: IOrganizationInvitationRepo
) {
  await organizationInvitationRepo.update(organizationInvitationId, {
    status: InviteStatus.DECLINED
  });
}
