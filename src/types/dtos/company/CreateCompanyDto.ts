import { ICompanyRepo } from 'src/repos/company.repo';
import { Company } from 'src/types/Company';

export type CreateCompanyDto = {
  companyData: Partial<Company>
  companyRepo: ICompanyRepo
}
