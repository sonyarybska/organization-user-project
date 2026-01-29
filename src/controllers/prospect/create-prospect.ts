import { CreateProspectDto } from 'src/types/dtos/prospect/CreateProspectDto';
import { normalizeLinkedinUrl } from './helpers/normalizeLinkedinUrl';

export async function createProspect({
  data,
  prospectRepo
}: CreateProspectDto) {
  const normalizedProspectLinkedinUrl = normalizeLinkedinUrl(
    data.linkedinUrl
  );

  const prospect = await prospectRepo.create({
    ...data,
    linkedinUrl: normalizedProspectLinkedinUrl
  });

  return { id: prospect.id };
}
