import { INotificationRepo } from 'src/repos/notification.repo';

export type GetUnreadCountDto = {
  userId: string;
  organizationId?: string;
  notificationRepo: INotificationRepo;
};
