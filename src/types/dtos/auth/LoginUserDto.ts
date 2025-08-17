import { User } from 'src/types/User';
import { IUserRepo } from 'src/repos/user-repo';
import { JWT } from '@fastify/jwt';

export type LoginUserDto = {
  userRepo: IUserRepo
  data: Partial<User>
  jwt: JWT
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
}
