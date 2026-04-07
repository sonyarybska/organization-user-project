import { IProspectRepo } from 'src/repos/prospect.repo';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export interface DeleteProspectByIdAndOrganizationIdDto {
  id: string;
  organizationId: string;
  prospectRepo: IProspectRepo;
  userId: string;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
}
