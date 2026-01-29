import { CreateCompanyDto } from 'src/types/dtos/company/CreateCompanyDto';

export async function createCompany({ companyData, companyRepo }: CreateCompanyDto) {
  return await companyRepo.create(companyData);
}
