import z from 'zod';
import { AttachmentResSchema } from './AttachmentResSchema';
import { UserOrganizationSchema } from 'src/types/UserOrganization';

export const UserResSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.email(),
  companyName: z.string().nullable(),
  companyUrl: z.string().nullable(),
  birthday: z.date().nullable(),
  userOrganizations: UserOrganizationSchema.array(),
  avatarId: z.uuid().nullable(),
  avatar: AttachmentResSchema.optional()
});