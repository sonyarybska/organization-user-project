import { JoinUserToOrganizationDto } from 'src/types/dtos/organization/JoinUserToOrganizationDto';
import { InviteStatus } from 'src/types/enums/InviteStatusEnums';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

export async function joinUserToOrganization({
  invitationId,
  userOrganizationRepo,
  organizationInvitationRepo,
  userId,
  email
}: JoinUserToOrganizationDto) {
  const invitation = await organizationInvitationRepo.getByIdAndEmail(
    invitationId,
    email
  );

  if (
    invitation.expiresAt < new Date() ||
    invitation.status !== InviteStatus.PENDING
  ) {
    throw new Error('Invitation is not valid or has accepted');
  }

  await userOrganizationRepo.assignUserToOrganization({
    userId,
    organizationId: invitation.organizationId,
    role: UserRoleEnum.USER
  });

  await organizationInvitationRepo.update(invitationId, {
    status: InviteStatus.ACCEPTED
  });
}
