import z from 'zod';

export const TokenReqSchema = z.object({
  token: z.string()
});