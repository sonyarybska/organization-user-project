import { IProspectRepo } from 'src/repos/prospect.repo';

export type GetProspectByOrgIdDto = {
  organizationId: string
  prospectRepo: IProspectRepo
}