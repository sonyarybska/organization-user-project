import { RegisterUserDto } from 'src/types/dtos/user/CreateUserDto';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function registerUser(data: RegisterUserDto): Promise<void> {
  const { password, organizationName, ...userCreateData } = data.createData;
  const { transactionService, cognitoService, trackingContext, trackingService } = data;

  const cognitoUserId = await cognitoService.createCognitoUser(data.createData.email, password);

  const { userId, organizationId } = await transactionService.run(async (connection) => {
    const { id: organizationId } = await data.organizationRepo.reconnect(connection).create({
      name: organizationName
    });

    const { id: userId } = await data.userRepo.reconnect(connection).create({
      ...userCreateData,
      cognitoUserId
    });

    await data.userOrganizationRepo.reconnect(connection).create({ userId, organizationId, role: UserRoleEnum.ADMIN });

    return { userId, organizationId };
  });

  trackingService.track({
    eventType: EventTypeEnum.UserRegistered,
    resourceType: EventResourceTypeEnum.User,
    resourceId: userId,
    userId,
    organizationId,
    trackingContext
  });

  trackingService.track({
    eventType: EventTypeEnum.OrganizationCreated,
    resourceType: EventResourceTypeEnum.Organization,
    resourceId: organizationId,
    userId,
    organizationId,
    trackingContext
  });
}
