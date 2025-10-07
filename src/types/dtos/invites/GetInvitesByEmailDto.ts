import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';

export type GetInvitesByEmail = {
    email: string;
    organizationInviteRepo: IOrganizationInviteRepo;
}