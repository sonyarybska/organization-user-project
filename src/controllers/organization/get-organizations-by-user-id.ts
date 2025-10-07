import { GetOrganizationsByUserIdDto } from 'src/types/dtos/organization/GetOrganizationsByUserIdDto';

export async function getOrganizationsByUserId({
  userId,
  organizationRepo
}: GetOrganizationsByUserIdDto) {
  return await organizationRepo.getByUserId(userId);
}