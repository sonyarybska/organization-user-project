import { z } from 'zod';

export const InvitationUuidSchema = z.object({
  invitationId: z.uuid()
});
