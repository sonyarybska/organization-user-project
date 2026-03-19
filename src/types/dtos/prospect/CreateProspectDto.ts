import { IProspectRepo } from 'src/repos/prospect.repo';
import { Prospect } from 'src/types/Prospect';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type CreateProspectDto = {
  data: Partial<Prospect>;
  prospectRepo: IProspectRepo;
  userId: string;
  organizationId: string;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
