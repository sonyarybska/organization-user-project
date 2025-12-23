import { ProspectSourceEnum } from 'src/types/enums/ProspectSourceEnum';
import z from 'zod';

export const ProspectResSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  companyName: z.string().nullable(),
  domain: z.string().nullable(),
  phone: z.string().nullable(),
  salary: z.number().nullable(),
  department: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  title: z.string().nullable(),
  userId: z.uuid(),
  organizationId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  source: z.enum(ProspectSourceEnum)
});

