import { z } from 'zod';
import { InviteStatus } from './enums/InviteStatusEnum';

//TODO
export const OrganizationInviteSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  organizationId: z.uuid(),
  expiresAt: z.date(),
  token: z.string(),
  status: z.enum(InviteStatus),
  createdAt: z.date()
});

export type OrganizationInvite = z.infer<
  typeof OrganizationInviteSchema
>
