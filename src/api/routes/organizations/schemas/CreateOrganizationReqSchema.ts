import { z } from 'zod';

export const CreateOrganizationReqSchema = z.object({
  name: z.string()
});
