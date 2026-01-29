import { getOrganizationRepo } from './organization.repo';
import { getUserRepo } from './user.repo';
import { DataSource } from 'typeorm';
import { getUserOrganizationRepo } from './user-organization.repo';
import { getOrganizationInviteRepo } from './organization-invite.repo';
import { getAttachmentRepo } from './attachment.repo';
import { getProspectRepo } from './prospect.repo';
import { getCsvImportRecordRepo } from './csv-import-record.repo';
import { getCompanyRepo } from './company.repo';

export interface IRepos {
  userRepo: ReturnType<typeof getUserRepo>
  organizationRepo: ReturnType<typeof getOrganizationRepo>
  userOrganizationRepo: ReturnType<typeof getUserOrganizationRepo>
  organizationInviteRepo: ReturnType<typeof getOrganizationInviteRepo>
  attachmentRepo: ReturnType<typeof getAttachmentRepo>
  prospectRepo: ReturnType<typeof getProspectRepo>
  csvImportRecordRepo: ReturnType<typeof getCsvImportRecordRepo>,
  companyRepo: ReturnType<typeof getCompanyRepo>
}

export function getRepos(db: DataSource) {
  return {
    userRepo: getUserRepo(db),
    organizationRepo: getOrganizationRepo(db),
    userOrganizationRepo: getUserOrganizationRepo(db),
    organizationInviteRepo: getOrganizationInviteRepo(db),
    attachmentRepo: getAttachmentRepo(db),
    prospectRepo: getProspectRepo(db),
    csvImportRecordRepo: getCsvImportRecordRepo(db),
    companyRepo: getCompanyRepo(db)
  };
}
