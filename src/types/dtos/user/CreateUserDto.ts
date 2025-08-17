import { IUserRepo } from 'src/repos/user-repo';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';
import { TransactionService } from 'src/types/TypeOrmTransactionService';
import { TypeOrmConnection } from 'src/types/TypeOrmConnection';
import { IOrganizationRepo } from 'src/repos/organization.repo';
import { CreateUserReq } from 'src/api/routes/users/schemas/CreateUserReqSchema';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { JWT } from '@fastify/jwt';

export type CreateUserDto = {
  userRepo: IUserRepo
  organizationRepo: IOrganizationRepo
  userOrganizationRepo: IUserOrganizationRepo
  transactionService: TransactionService<TypeOrmConnection>
  sendGridService: ISendGridService
  jwt: JWT
  expiresIn: string
  data: CreateUserReq
}
