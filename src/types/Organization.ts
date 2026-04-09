import { z } from 'zod';

export const OrganizationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  monthlyImportLimit: z.number()
});

export type Organization = z.infer<typeof OrganizationSchema>;
