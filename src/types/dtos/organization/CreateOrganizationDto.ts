import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { Organization } from 'src/types/Organization';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { TransactionService } from 'src/types/interfaces/TypeOrmTransactionService';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type CreateOrganizationDto = {
  organizationData: Partial<Organization>;
  organizationRepo: IOrganizationRepo;
  userOrganizationRepo: IUserOrganizationRepo;
  transactionService: TransactionService<TypeOrmConnection>;
  userId: string;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
