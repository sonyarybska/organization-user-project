import { DeclineOrganizationInviteDto } from 'src/types/dtos/invites/DeclineOrganizationInviteDto';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const inviteTokenSecret = process.env.INVITE_TOKEN_SECRET;

export async function declineOrganizationInvite({
  token,
  organizationInviteRepo,
  status,
  hmacService
}: DeclineOrganizationInviteDto) {
  const invite = await organizationInviteRepo.getValidPendingByToken(token);

  const isTokenValid = hmacService.validateToken(
    token,
    `${invite.email}-${invite.expiresAt}`,
    invite.expiresAt.getTime(),
    inviteTokenSecret
  );

  if (!isTokenValid) {
    throw new ApplicationError('Invalid invite token');
  }

  await organizationInviteRepo.updateStatusById(invite.id, status);
}
