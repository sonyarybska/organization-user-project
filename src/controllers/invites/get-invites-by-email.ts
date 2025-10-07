import { GetInvitesByEmail } from 'src/types/dtos/invites/GetInvitesByEmailDto';

export function getInvitesByEmail({
  email,
  organizationInviteRepo
}: GetInvitesByEmail) {
  return organizationInviteRepo.getByEmail(email);
}