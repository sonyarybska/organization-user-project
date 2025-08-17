import { z } from 'zod';
import { InviteStatus } from './enums/InviteStatusEnums';

export const OrganizationInvitationSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  organizationId: z.uuid(),
  expiresAt: z.date(),
  status: z.enum(InviteStatus),
  createdAt: z.date()
});

export type OrganizationInvitation = z.infer<
  typeof OrganizationInvitationSchema
>
