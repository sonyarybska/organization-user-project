import { z } from 'zod';

export const UpdateCompanyReqSchema = z.object({
  linkedinUrl: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional()
});
