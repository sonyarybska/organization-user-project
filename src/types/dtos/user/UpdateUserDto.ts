import { IUserRepo } from 'src/repos/user-repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';
import { User } from 'src/types/User';

export type UpdateUserDto = {
  userId: string
  data: Partial<User>
  userRepo: IUserRepo,
  s3Service: IS3Service,
  expireInSeconds: number
}
