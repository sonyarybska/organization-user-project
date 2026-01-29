import { z } from 'zod';
import { SourceTypeEnum } from './enums/SourceTypeEnum';

export const CompanySchema = z.object({
  id: z.uuid(),
  domain: z.string(),
  source: z.enum(SourceTypeEnum),
  organizationId: z.string(),
  linkedinUrl: z.string().nullable(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Company = z.infer<typeof CompanySchema>
