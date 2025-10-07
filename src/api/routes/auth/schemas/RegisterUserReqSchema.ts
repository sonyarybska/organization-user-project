import z from 'zod';

export const RegisterUserReqSchema = z.object({
  name: z.string(),
  organizationName: z.string(),
  email: z.email(),
  password: z.string(),
  companyName: z.string(),
  companyUrl: z.string(),
  birthday: z.coerce.date()
});

export type RegisterUserReq = z.infer<typeof RegisterUserReqSchema>
