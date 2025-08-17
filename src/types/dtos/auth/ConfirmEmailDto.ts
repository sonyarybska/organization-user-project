import { JWT } from '@fastify/jwt'
import { IUserRepo } from 'src/repos/user-repo'

export type ConfirmEmailDto = {
  userRepo: IUserRepo
  token: string
  jwt: JWT
}
