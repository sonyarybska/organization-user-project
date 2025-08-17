import { AttachmentResSchema } from 'src/api/common/AttachmentResSchema';
import { UserOrganizationSchema } from 'src/types/UserOrganization';
import { z } from 'zod';

export const GetUserResSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  companyName: z.string(),
  companyUrl: z.string(),
  birthday: z.date(),
  isConfirm: z.boolean().default(false),
  userOrganizations: z.array(UserOrganizationSchema),
  avatarId: z.uuid().nullish(),
  avatar: AttachmentResSchema.nullish()
});

export type GetUserRes = z.infer<typeof GetUserResSchema>
