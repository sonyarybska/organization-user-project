import { GetCompanyByIdAndOrgIdDto } from 'src/types/dtos/company/GetCompanyByIdAndOrgIdDto';

export async function getCompanyByIdAndOrgId({
  id,
  organizationId,
  companyRepo
}: GetCompanyByIdAndOrgIdDto) {
  return await companyRepo.getByIdAndOrganizationId(id, organizationId);
}
