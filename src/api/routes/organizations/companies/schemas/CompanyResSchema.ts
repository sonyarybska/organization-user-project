import { z } from 'zod';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';

export const CompanyResSchema = z.object({
  id: z.string(),
  domain: z.string(),
  source: z.enum(SourceTypeEnum),
  linkedinUrl: z.string().nullable(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
