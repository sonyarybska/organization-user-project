import { CreateOrganizationDto } from 'src/types/dtos/organization/CreateOrganizationDto';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

export function createOrganization(data: CreateOrganizationDto) {
  const { organizationRepo, userOrganizationRepo, transactionService } = data;
  
  return transactionService.run(async (connection) => {
    const organization = await organizationRepo
      .reconnect(connection)
      .create(data.organizationData);

    await userOrganizationRepo
      .reconnect(connection)
      .create({
        userId:data.userId,
        organizationId: organization.id,
        role: UserRoleEnum.ADMIN
      });

    return organization;
  });
}
