import { IUserRepo } from 'src/repos/user.repo';
import { User } from 'src/types/User';

export type UpdateUserDto = {
  userId: string
  userData: Partial<User>
  userRepo: IUserRepo,
}
