import { GetOrganizationInvitations } from 'src/types/dtos/organization/GetOrganizationInvitationsDto';

export async function getOrganizationInvitations({
  organizationId,
  userId,
  organizationInvitationRepo
}: GetOrganizationInvitations) {
  return await organizationInvitationRepo.getAllByOrganizationIdAndUserId(
    organizationId,
    userId
  );
}
