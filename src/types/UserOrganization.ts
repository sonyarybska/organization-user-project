import { z } from 'zod';
import { UserRoleEnum } from './enums/UserRoleEnum';

export const UserOrganizationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  organizationId: z.uuid(),
  role: z.enum(UserRoleEnum).default(UserRoleEnum.USER)
});

export type UserOrganization = z.infer<typeof UserOrganizationSchema>
