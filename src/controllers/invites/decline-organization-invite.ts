import { DeclineOrganizationInviteDto } from 'src/types/dtos/invites/DeclineOrganizationInviteDto';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const inviteTokenSecret = process.env.INVITE_TOKEN_SECRET;

export async function declineOrganizationInvite({
  token,
  organizationInviteRepo,
  status,
  hmacService
}: DeclineOrganizationInviteDto) {
  const invite = await organizationInviteRepo.getByToken(token);

  const isTokenValid = hmacService.validateToken(
    token,
    `${invite.email}-${invite.expiresAt}`,
    invite.expiresAt.getTime(),
    inviteTokenSecret
  );

  if (!isTokenValid) {
    throw new ApplicationError('Invalid invite token');
  }

  if (invite.expiresAt < new Date()) {
    throw new ApplicationError('Invite has expired');
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new ApplicationError('Invite is already accepted or declined');
  }

  await organizationInviteRepo.updateStatusById(invite.id, status);
}
