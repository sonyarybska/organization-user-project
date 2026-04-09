import { INotificationRepo } from 'src/repos/notification.repo';

export type MarkNotificationAsReadDto = {
  id: string;
  userId: string;
  notificationRepo: INotificationRepo;
};
