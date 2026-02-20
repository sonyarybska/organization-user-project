import { CreateProspectDto } from 'src/types/dtos/prospect/CreateProspectDto';

export async function createProspect({
  data,
  prospectRepo
}: CreateProspectDto) {

  const prospect = await prospectRepo.create(data);
  return { id: prospect.id };
}
