import { ImportCsvProspect } from 'src/api/routes/organizations/prospects/csv-import-records/schemas/ImportCsvProspectSchema';

export type ProcessProspectCsvRowMessageDto = {
  importRecordId: string
  row: Partial<ImportCsvProspect>
  isDuplicate: boolean
}