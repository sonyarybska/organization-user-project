import { ICompanyRepo } from 'src/repos/company.repo';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export interface DeleteCompanyByIdAndOrgIdDto {
  id: string;
  organizationId: string;
  companyRepo: ICompanyRepo;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
  userEmail: string;
}
