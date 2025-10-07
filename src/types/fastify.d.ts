import { DataSource } from 'typeorm';
import { IRepos } from 'src/repos';
import { User } from 'src/types/User';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';
import { TransactionService } from './interfaces/TypeOrmTransactionService';
import { TypeOrmConnection } from './interfaces/TypeOrmConnection';
import { UserOrganization } from './UserOrganization';
import { IS3Service } from 'src/services/aws/s3/s3.service';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';
import { ISqsService } from 'src/services/aws/sqs/sqs.service';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource
    repos: IRepos
    sendGridService: ISendGridService
    transactionService: TransactionService<TypeOrmConnection>
    s3Service: IS3Service
    cognitoService: ICognitoService
    sqsService: ISqsService
    hmacService: IHMACService
  }

  interface FastifyContextConfig {
    skipAuth?: boolean
    skipConfirmEmail?: boolean
    skipUserOrganization?: boolean
  }

  interface FastifyRequest {
    userProfile: User
    userOrganization: UserOrganization
  }
}
