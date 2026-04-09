import { z } from 'zod';

export const ReadAllNotificationQuerySchema = z.object({
  organizationId: z.uuid().optional()
});
