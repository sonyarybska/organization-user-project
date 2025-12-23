import { DeleteProspectByIdAndOrganizationIdDto } from 'src/types/dtos/prospect/DeleteProspectByIdAndOrganizationId';

export function deleteProspectsByIdAndOrganizationId({
  id,
  organizationId,
  prospectRepo
}: DeleteProspectByIdAndOrganizationIdDto) {
  return prospectRepo.deleteByIdAndOrganizationId(id, organizationId);
}