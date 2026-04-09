import { z } from 'zod';

export const PaginationSchema = z.object({
  limit: z.coerce.number().default(1),
  offset: z.coerce.number().default(0)
});

export type Pagination = z.infer<typeof PaginationSchema>;
