import { z } from 'zod';

export const GetUnreadCountResSchema = z.object({
  count: z.number()
});
