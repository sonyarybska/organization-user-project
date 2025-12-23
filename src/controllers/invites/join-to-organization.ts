import { JoinUserToOrganizationDto } from 'src/types/dtos/organization/JoinUserToOrganizationDto';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const inviteTokenSecret = process.env.INVITE_TOKEN_SECRET;

export async function joinUserToOrganization(data: JoinUserToOrganizationDto) {
  const {
    organizationInviteRepo,
    userRepo,
    userOrganizationRepo,
    cognitoService,
    hmacService,
    transactionService
  } = data;

  const invite = await organizationInviteRepo.getValidPendingByToken(data.token);

  const isTokenValid = hmacService.validateToken(
    data.token,
    `${invite.email}-${invite.expiresAt}`,
    invite.expiresAt.getTime(),
    inviteTokenSecret
  );

  if (!isTokenValid) {
    throw new ApplicationError('Invalid invite token');
  }

  let user = await userRepo.getByEmail(invite.email);

  await transactionService.run(async (connection) => {
    if (!user) {
      const cognitoUserId = await cognitoService.createCognitoUser(invite.email);

      user = await userRepo.reconnect(connection).create({
        email: invite.email,
        cognitoUserId
      });
    }

    await userOrganizationRepo.reconnect(connection).create({
      userId: user.id,
      organizationId: invite.organizationId,
      role: UserRoleEnum.USER
    });

    await organizationInviteRepo
      .reconnect(connection)
      .updateStatusById(invite.id, InviteStatus.ACCEPTED);
  });
}
