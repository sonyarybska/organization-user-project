import { IProspectRepo } from 'src/repos/prospect.repo';
import { Prospect } from 'src/types/Prospect';

export type CreateProspectDto = {
  data: Partial<Prospect>
  prospectRepo: IProspectRepo
}