import { DataSource } from 'typeorm';
import { IRepos } from '../repos';
import { User } from 'src/types/User';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';
import { TransactionService } from './TypeOrmTransactionService';
import { TypeOrmConnection } from './TypeOrmConnection';
import { UserOrganization } from './UserOrganization';
import { IS3Service } from 'src/services/aws/s3/s3.service';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource
    repos: IRepos
    sendGridService: ISendGridService
    transactionService: TransactionService<TypeOrmConnection>
    s3Service: IS3Service
  }

  interface FastifyContextConfig {
    skipAuth?: boolean
    skipConfirmEmail?: boolean
    skipUserOrganization?: boolean
    checkAdminRole?: boolean
  }

  interface FastifyRequest {
    userProfile: User
    userOrganization: UserOrganization
  }
}
