import { UpdateCompanyByIdAndOrgIdDto } from 'src/types/dtos/company/UpdateCompanyByIdAndOrgIdDto';

export async function updateCompanyByIdAndOrgId({
  id,
  organizationId,
  companyData,
  companyRepo
}: UpdateCompanyByIdAndOrgIdDto) {
  return  await companyRepo.updateByIdAndOrganizationId(id, organizationId, companyData);
}
