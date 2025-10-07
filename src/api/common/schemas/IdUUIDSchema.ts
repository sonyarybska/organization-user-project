import z from 'zod';

export const IdUUIDSchema = z.object({
  id: z.uuid()
});