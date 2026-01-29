import { ICompanyRepo } from 'src/repos/company.repo';

export interface DeleteCompanyByIdAndOrgIdDto {
  id: string
  organizationId: string
  companyRepo: ICompanyRepo
}
