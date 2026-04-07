import { ICompanyRepo } from 'src/repos/company.repo';
import { Company } from 'src/types/Company';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type UpdateCompanyByIdAndOrgIdDto = {
  id: string;
  organizationId: string;
  companyData: Partial<Company>;
  companyRepo: ICompanyRepo;
  userId: string;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
