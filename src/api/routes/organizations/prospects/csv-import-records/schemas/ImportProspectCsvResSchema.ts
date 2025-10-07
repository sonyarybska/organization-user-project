import { z } from 'zod';

export const ImportProspectCsvResSchema = z.object({
  csvImportRecordId: z.uuid()
});
