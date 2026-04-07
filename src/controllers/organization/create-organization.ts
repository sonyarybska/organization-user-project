import { CreateOrganizationDto } from 'src/types/dtos/organization/CreateOrganizationDto';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function createOrganization(data: CreateOrganizationDto) {
  const { organizationRepo, userOrganizationRepo, transactionService, userId, trackingContext, trackingService } = data;

  const organization = await transactionService.run(async (connection) => {
    const organization = await organizationRepo.reconnect(connection).create(data.organizationData);

    await userOrganizationRepo.reconnect(connection).create({
      userId,
      organizationId: organization.id,
      role: UserRoleEnum.ADMIN
    });

    return organization;
  });

  trackingService.track({
    eventType: EventTypeEnum.OrganizationCreated,
    resourceType: EventResourceTypeEnum.Organization,
    resourceId: organization.id,
    userId,
    organizationId: organization.id,
    trackingContext
  });
  return organization;
}
