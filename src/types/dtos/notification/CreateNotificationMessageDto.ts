import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';

export type CreateNotificationMessageDto = {
  userId: string;
  organizationId: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
};
