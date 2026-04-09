import { z } from 'zod';

export const GetUnreadCountQuerySchema = z.object({
  organizationId: z.uuid().optional()
});
