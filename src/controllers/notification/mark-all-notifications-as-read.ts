import { MarkAllAsReadDto } from 'src/types/dtos/notification/MarkAllAsReadDto';

export async function markAllNotificationsAsRead({ userId, organizationId, notificationRepo }: MarkAllAsReadDto) {
  await notificationRepo.markAllAsRead(userId, organizationId);
}
