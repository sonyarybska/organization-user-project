import { MarkNotificationAsReadDto } from 'src/types/dtos/notification/MarkNotificationAsReadDto';

export async function markNotificationAsRead({ id, userId, notificationRepo }: MarkNotificationAsReadDto) {
  await notificationRepo.markAsRead(id, userId);
}
