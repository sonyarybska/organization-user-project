import { z } from 'zod';

export const CreateOrganizationReqSchema = z.object({
  name: z.string(),
  monthlyImportLimit: z.number().int().positive().default(1000)
});
