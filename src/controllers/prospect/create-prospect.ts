import { CreateProspectDto } from 'src/types/dtos/prospect/CreateProspectDto';

export async function createProspect({
  data,
  prospectRepo
}: CreateProspectDto) {
 const { id } = await prospectRepo.create(data);
 return { id };
}
