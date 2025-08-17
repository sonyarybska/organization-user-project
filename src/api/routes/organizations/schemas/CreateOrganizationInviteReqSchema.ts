import { z } from 'zod';

export const CreateOrganizationInviteReqSchema = z.object({
  email: z.email()
});
