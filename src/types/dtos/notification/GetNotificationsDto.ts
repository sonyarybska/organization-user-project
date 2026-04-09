import { Pagination } from 'src/api/routes/schemas/PaginationSchema';
import { INotificationRepo } from 'src/repos/notification.repo';

export type GetNotificationsDto = {
  userId: string;
  organizationId?: string;
  isRead?: boolean;
  notificationRepo: INotificationRepo;
  pagination: Pagination;
};
