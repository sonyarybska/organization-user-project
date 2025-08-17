import { CreateOrganizationDto } from 'src/types/dtos/organization/CreateOrganizationDto';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

export function createOrganization({
  organizationRepo,
  userOrganizationRepo,
  transactionService,
  data,
  userId
}: CreateOrganizationDto) {
  return transactionService.run(async (connection) => {
    const organization = await organizationRepo
      .reconnect(connection)
      .create(data);

    await userOrganizationRepo
      .reconnect(connection)
      .assignUserToOrganization({
        userId,
        organizationId: organization.id,
        role: UserRoleEnum.ADMIN
      });

    return organization;
  });
}
