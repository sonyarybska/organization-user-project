import z from 'zod';
import { SourceTypeEnum } from './enums/SourceTypeEnum';

export const ProspectSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  domain: z.string().nullable(),
  phone: z.string().nullable(),
  salary: z.number().nullable(),
  department: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  title: z.string().nullable(),
  companyId: z.uuid().nullable(),
  userId: z.uuid(),
  organizationId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  source: z.enum(SourceTypeEnum)
});

export type Prospect = z.infer<typeof ProspectSchema>;