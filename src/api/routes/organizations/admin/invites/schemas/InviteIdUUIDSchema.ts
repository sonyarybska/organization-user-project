import z from 'zod';

export const InviteIdUUIDSchema = z.object({
  inviteId: z.uuid()
});
