import { ICompanyRepo } from 'src/repos/company.repo';
import { Company } from 'src/types/Company';

export type UpdateCompanyByIdAndOrgIdDto = {
  id: string
  organizationId: string
  companyData: Partial<Company>
  companyRepo: ICompanyRepo
}
