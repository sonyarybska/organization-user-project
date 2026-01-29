import { z } from 'zod';

export const CreateCompanyReqSchema = z.object({
  domain: z.string(),
  linkedinUrl: z.string().nullish(),
  name: z.string().nullish(),
  address: z.string().nullish()
});

export type CreateCompanyReq = z.infer<typeof CreateCompanyReqSchema>
