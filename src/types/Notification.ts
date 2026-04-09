import z from 'zod';
import { NotificationTypeEnum } from './enums/NotificationTypeEnum';

export const NotificationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  organizationId: z.uuid().nullable(),
  type: z.enum(NotificationTypeEnum),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  readAt: z.date().nullable(),
  createdAt: z.date()
});

export type Notification = z.infer<typeof NotificationSchema>;
