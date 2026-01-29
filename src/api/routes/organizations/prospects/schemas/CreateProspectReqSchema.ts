import { z } from 'zod';

export const CreateProspectReqSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  companyId: z.uuid(),
  domain: z.string().nullish(),
  phone: z.string().nullish(),
  salary: z.number().nullish(),
  department: z.string().nullish(),
  linkedinUrl: z.string().nullish(),
  title: z.string().nullish()
});

export type CreateProspectReq = z.infer<typeof CreateProspectReqSchema>;
