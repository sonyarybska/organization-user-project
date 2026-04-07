export enum EventTypeEnum {
  UserLogin = 'user.login',
  UserRegistered = 'user.registered',
  UserUpdated = 'user.updated',
  OrganizationCreated = 'organization.created',
  InviteCreated = 'invite.created',
  InviteAccepted = 'invite.accepted',
  InviteDeclined = 'invite.declined',
  ProspectCreated = 'prospect.created',
  ProspectDeleted = 'prospect.deleted',
  CompanyCreated = 'company.created',
  CompanyUpdated = 'company.updated',
  CompanyDeleted = 'company.deleted',
  CsvImportStarted = 'csv_import.started',
  CsvImportCompleted = 'csv_import.completed',
  CsvImportFailed = 'csv_import.failed',
  AttachmentUploaded = 'attachment.uploaded'
}