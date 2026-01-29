import { ICompanyRepo } from 'src/repos/company.repo';

export type GetCompanyByIdAndOrgIdDto = {
  id: string
  organizationId: string
  companyRepo: ICompanyRepo
}
