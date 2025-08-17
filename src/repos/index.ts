import { getOrganizationRepo } from './organization.repo';
import { getUserRepo } from './user-repo';
import { DataSource } from 'typeorm';
import { getUserOrganizationRepo } from './user-organization.repo';
import { getOrganizationInvitationRepo } from './organization-invitation.repo';
import { getAttachmentRepo } from './attachment.repo';

export interface IRepos {
  userRepo: ReturnType<typeof getUserRepo>
  organizationRepo: ReturnType<typeof getOrganizationRepo>
  userOrganizationRepo: ReturnType<typeof getUserOrganizationRepo>
  organizationInvitationRepo: ReturnType<typeof getOrganizationInvitationRepo>
  attachmentRepo: ReturnType<typeof getAttachmentRepo>
}

export function getRepos(db: DataSource) {
  return {
    userRepo: getUserRepo(db),
    organizationRepo: getOrganizationRepo(db),
    userOrganizationRepo: getUserOrganizationRepo(db),
    organizationInvitationRepo: getOrganizationInvitationRepo(db),
    attachmentRepo: getAttachmentRepo(db)
  };
}
