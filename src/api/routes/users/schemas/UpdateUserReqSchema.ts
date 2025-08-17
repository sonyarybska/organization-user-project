import { z } from 'zod';

export const UpdateUserReqSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().optional(),
  companyUrl: z.string().optional(),
  birthday: z.date().optional(),
  avatarId: z.uuid().optional()
});
