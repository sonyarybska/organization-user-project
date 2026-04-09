import { INotificationRepo } from 'src/repos/notification.repo';

export type MarkAllAsReadDto = {
  userId: string;
  organizationId?: string;
  notificationRepo: INotificationRepo;
};
