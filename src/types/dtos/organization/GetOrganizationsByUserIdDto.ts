import { IOrganizationRepo } from 'src/repos/organization.repo';

export type GetOrganizationsByUserIdDto = {
    userId: string;
    organizationRepo: IOrganizationRepo;
}