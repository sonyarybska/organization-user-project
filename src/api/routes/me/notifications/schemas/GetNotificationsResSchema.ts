import { z } from 'zod';
import { NotificationResSchema } from './NotificationResSchema';

export const GetNotificationsResSchema = z.object({
  notifications: z.array(NotificationResSchema),
  total: z.number()
});
