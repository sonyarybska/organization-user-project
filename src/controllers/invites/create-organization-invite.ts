import { CreateOrganizationInviteDto } from 'src/types/dtos/organization/CreateOrganizationInviteDto';

const inviteTokenExpireInMillis = Number(
  process.env.INVITE_TOKEN_EXPIRE_IN_MILLIS
);

const inviteTokenSecret = process.env.INVITE_TOKEN_SECRET;

export async function createOrganizationInvite(
  data: CreateOrganizationInviteDto
) {
  const {
    organizationRepo,
    organizationInviteRepo,
    sendGridService,
    hmacService
  } = data;

  const { name: organizationName } = await organizationRepo.getByIdAndUserId(
    data.organizationId,
    data.userId
  );

  const expiresAt = new Date(Date.now() + inviteTokenExpireInMillis);

  const token = hmacService.getSignature(
    `${data.email}-${expiresAt}`,
    inviteTokenSecret
  );

  await organizationInviteRepo.createInvite({
    email: data.email,
    organizationId: data.organizationId,
    expiresAt,
    token
  });

  await sendGridService.sendInviteEmail(data.email, organizationName, token);
}
