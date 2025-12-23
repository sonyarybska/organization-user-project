import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { z } from 'zod';

export const OrganizationInviteResSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  organizationId: z.uuid(),
  expiresAt: z.date(),
  token: z.string(),
  status: z.enum(InviteStatus),
  createdAt: z.date()
});

