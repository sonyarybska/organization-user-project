import { UpdateUserDto } from 'src/types/dtos/user/UpdateUserDto';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';

export async function updateUserById(data: UpdateUserDto) {
  const { userRepo, trackingService, trackingContext, userId, userEmail } = data;
  await userRepo.updateUser(userId, data.userData);

  trackingService.track({
    eventType: EventTypeEnum.UserUpdated,
    trackingContext,
    organizationId: null,
    userEmail,
    resourceType: EventResourceTypeEnum.User,
    resourceId: userId
  });
}
