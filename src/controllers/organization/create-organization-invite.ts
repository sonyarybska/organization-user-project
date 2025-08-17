import { CreateOrganizationInvitationDto } from 'src/types/dtos/organization/CreateOrganizationInviteDto';

export async function createOrganizationInvite({
  email,
  organizationId,
  organizationRepo,
  sendGridService,
  inviteTokenExpireInMillis,
  organizationInvitationRepo,
  userRepo,
  userId
}: CreateOrganizationInvitationDto) {
  const { name: organizationName } = await organizationRepo.getByIdAndUserId(
    organizationId,
    userId
  );
  const { name } = await userRepo.getByEmail(email!);

  const { id } = await organizationInvitationRepo.createInvite({
    email,
    organizationId,
    expiresAt: new Date(Date.now() + inviteTokenExpireInMillis)
  });

  await sendGridService.sendInvitationEmail(email, name, organizationName, id);

  return { invitationId: id };
}
