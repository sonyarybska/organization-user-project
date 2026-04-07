import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { IUserRepo } from 'src/repos/user.repo';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';
import { IHMACService } from 'src/services/hmac/hmac.service';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { TransactionService } from 'src/types/interfaces/TypeOrmTransactionService';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type JoinUserToOrganizationDto = {
  token: string;
  userOrganizationRepo: IUserOrganizationRepo;
  organizationInviteRepo: IOrganizationInviteRepo;
  userRepo: IUserRepo;
  cognitoService: ICognitoService;
  transactionService: TransactionService<TypeOrmConnection>;
  hmacService: IHMACService;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
