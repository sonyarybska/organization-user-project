import z from 'zod';

export const LoginUserReqSchema = z.object({
  email: z.email(),
  password: z.string()
});
