import z from 'zod';
import { CsvImportStatusEnum } from './enums/CsvImportStatusEnum';

export const CsvImportRecordSchema = z.object({
  id: z.uuid(),
  key: z.string(),
  organizationId: z.uuid(),
  userId: z.uuid(),
  status: z.enum(CsvImportStatusEnum),
  totalRows: z.number().nullable(),      
  processedRows: z.number().nullable(), 
  failedRows: z.number().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type CsvImportRecord = z.infer<typeof CsvImportRecordSchema>
