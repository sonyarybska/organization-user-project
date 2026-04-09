import { GetUnreadCountDto } from 'src/types/dtos/notification/GetUnreadCountDto';

export async function getUnreadCount({ userId, organizationId, notificationRepo }: GetUnreadCountDto) {
  const count = await notificationRepo.countUnread(userId, organizationId);
  return { count };
}
