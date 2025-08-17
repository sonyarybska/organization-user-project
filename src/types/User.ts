import z from 'zod';
import { UserOrganizationSchema } from './UserOrganization';
import { AttachmentSchema } from './Attachment';

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  password: z.string(),
  companyName: z.string(),
  companyUrl: z.string(),
  birthday: z.date(),
  isConfirm: z.boolean().default(false),
  userOrganizations: z.array(UserOrganizationSchema),
  avatarId: z.uuid().optional(),
  avatar: AttachmentSchema.optional()
});
export type User = z.infer<typeof UserSchema>
