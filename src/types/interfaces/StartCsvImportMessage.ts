export interface StartCsvImportMessage {
  importRecordId: string;
  userId: string;
  mapping: Record<string, string>;
  organizationId: string;
  key: string;
}