import { CreateNotificationDto } from 'src/types/dtos/notification/CreateNotificationDto';

export async function createNotification({ notificationData, notificationRepo }: CreateNotificationDto) {
  return await notificationRepo.create(notificationData);
}
