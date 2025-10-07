import { GetOrganizationInvitesDto } from 'src/types/dtos/organization/GetOrganizationInvitesDto';

export async function getInvitesByOrganizationId({
  organizationId,
  organizationInviteRepo
}: GetOrganizationInvitesDto) {
  return await organizationInviteRepo.getByOrganizationId(
    organizationId
  );
}
