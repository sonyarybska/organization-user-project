import { GetProspectByOrgIdDto } from 'src/types/dtos/prospect/GetProspectsByOrgIdDto';

export function getProspectsByOrganizationId({ prospectRepo,organizationId }:GetProspectByOrgIdDto) {
  return prospectRepo.getByOrganizationId(organizationId);
}