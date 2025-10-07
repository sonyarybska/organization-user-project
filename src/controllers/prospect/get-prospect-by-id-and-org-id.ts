import { GetProspectByIdAndOrgIdDto } from 'src/types/dtos/prospect/GetProspectByIdAndOrgIdDto';

export function getProspectByIdAndOrgId({
  id,
  organizationId,
  prospectRepo
}: GetProspectByIdAndOrgIdDto) {
  return prospectRepo.getByIdAndOrganizationId(id, organizationId);
}
