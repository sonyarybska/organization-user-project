import { IUserRepo } from 'src/repos/user-repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';

export type GetUserByIdDto = {
  userId: string,
  userRepo: IUserRepo,
  s3Service: IS3Service,
  expireInSeconds: number
}
