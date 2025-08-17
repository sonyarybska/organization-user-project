import { z } from 'zod';

export const CreateUserResSchema = z.object({
  name: z.string(),
  email: z.email(),
  companyName: z.string(),
  companyUrl: z.string(),
  birthday: z.date()
});

export type CreateUserRes = z.infer<typeof CreateUserResSchema>
