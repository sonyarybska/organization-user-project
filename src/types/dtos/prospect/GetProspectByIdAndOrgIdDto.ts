import { IProspectRepo } from 'src/repos/prospect.repo';

export type GetProspectByIdAndOrgIdDto = {
  id: string
  organizationId: string
  prospectRepo: IProspectRepo
}