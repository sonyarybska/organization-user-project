import { IUserRepo } from 'src/repos/user.repo';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';
import { TransactionService } from 'src/types/interfaces/TypeOrmTransactionService';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';
import { RegisterUserReq } from 'src/api/routes/auth/schemas/RegisterUserReqSchema';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type RegisterUserDto = {
  userRepo: IUserRepo;
  organizationRepo: IOrganizationRepo;
  userOrganizationRepo: IUserOrganizationRepo;
  transactionService: TransactionService<TypeOrmConnection>;
  sendGridService: ISendGridService;
  cognitoService: ICognitoService;
  createData: RegisterUserReq;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
