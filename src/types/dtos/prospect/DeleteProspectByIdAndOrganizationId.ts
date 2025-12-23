import { IProspectRepo } from 'src/repos/prospect.repo';

export interface DeleteProspectByIdAndOrganizationIdDto {
  id: string
  organizationId: string
  prospectRepo: IProspectRepo
}
