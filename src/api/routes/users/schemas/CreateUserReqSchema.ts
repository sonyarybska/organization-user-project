import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import z from 'zod';

export const CreateUserReqSchema = z.object({
  name: z.string(),
  organizationName: z.string(),
  email: z.email(),
  password: z.string(),
  companyName: z.string(),
  companyUrl: z.string(),
  birthday: z.coerce.date(),
  role: z.enum(UserRoleEnum)
});

export type CreateUserReq = z.infer<typeof CreateUserReqSchema>
