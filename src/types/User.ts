import z from 'zod';
import { UserOrganizationSchema } from './UserOrganization';
import { AttachmentSchema } from './Attachment';

export const UserSchema = z.object({
  id: z.uuid(),
  cognitoUserId: z.string(),
  name: z.string().nullable(),
  email: z.email(),
  companyName: z.string().nullable(),
  companyUrl: z.string().nullable(),
  birthday: z.date().nullable(),
  userOrganizations: z.array(UserOrganizationSchema),
  avatarId: z.uuid().nullable(),
  avatar: AttachmentSchema.optional()
});
export type User = z.infer<typeof UserSchema>
