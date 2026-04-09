import { GetNotificationsDto } from 'src/types/dtos/notification/GetNotificationsDto';

export async function getNotifications({ userId, organizationId, isRead, notificationRepo, pagination }: GetNotificationsDto) {
  return await notificationRepo.getByUserId(userId, pagination, { organizationId, isRead });
}
