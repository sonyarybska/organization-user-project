import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';
import { INotificationRepo } from 'src/repos/notification.repo';

export type CreateNotificationDto = {
  notificationData: {
    userId: string;
    organizationId?: string;
    type: NotificationTypeEnum;
    title: string;
    message: string;
  };
  notificationRepo: INotificationRepo;
};
