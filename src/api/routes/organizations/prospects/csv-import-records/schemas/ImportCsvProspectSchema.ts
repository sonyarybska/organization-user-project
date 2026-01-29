import { z } from 'zod';

export const ImportCsvProspectSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  organizationId:z.uuid(),
  domain: z.string().nullish(),
  phone: z.string().nullish(),
  salary: z.number().nullish(),
  department: z.string().nullish(),
  linkedinUrl: z.string().nullish(),
  title: z.string().nullish(),
  companyName: z.string().nullish(),
  companyAddress: z.string().nullish(),
  companyLinkedinUrl: z.string().nullish()
});

export type ImportCsvProspect = z.infer<typeof ImportCsvProspectSchema>;