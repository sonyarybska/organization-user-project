import { z } from 'zod';
import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';

export const NotificationResSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  organizationId: z.uuid().nullable(),
  type: z.enum(NotificationTypeEnum),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date()
});
