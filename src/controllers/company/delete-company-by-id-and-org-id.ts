import { DeleteCompanyByIdAndOrgIdDto } from 'src/types/dtos/company/DeleteCompanyByIdAndOrgIdDto';

export function deleteCompanyByIdAndOrgId({
  id,
  organizationId,
  companyRepo
}: DeleteCompanyByIdAndOrgIdDto) {
  return companyRepo.deleteByIdAndOrganizationId(id, organizationId);
}
