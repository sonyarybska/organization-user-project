import { z } from 'zod';

export const PaginationSchema = z.object({
    limit: z.number().default(1),
    offset: z.number().default(0)
});