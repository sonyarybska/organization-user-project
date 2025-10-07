import { DeclineOrganizationInviteByAdminDto } from 'src/types/dtos/invites/DeclineOrganizationInviteByAdminDto';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { ApplicationError } from 'src/types/errors/ApplicationError';

export async function declineOrganizationInviteByAdmin({
  inviteId,
  organizationInviteRepo,
  status,
  organizationId
}: DeclineOrganizationInviteByAdminDto) {
  const invite = await organizationInviteRepo.getByIdAndOrganizationId(inviteId, organizationId);
 
  if (invite.expiresAt < new Date()) {
    throw new ApplicationError('Invite has expired');
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new ApplicationError('Invite is already accepted or declined');
  }
  
  await organizationInviteRepo.updateStatusById(
    inviteId,
    status
  );
}
