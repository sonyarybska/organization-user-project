import { z } from 'zod';
import { PaginationSchema } from '../../../schemas/PaginationSchema';

export const GetNotificationsQuerySchema = z.object({
  organizationId: z.uuid().optional(),
  isRead: z.boolean().optional(),
  ...PaginationSchema.shape
});
