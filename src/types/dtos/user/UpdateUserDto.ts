import { IUserRepo } from 'src/repos/user.repo';
import { User } from 'src/types/User';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { ITrackingService } from 'src/services/tracking/tracking.service';

export type UpdateUserDto = {
  userId: string;
  userData: Partial<User>;
  userRepo: IUserRepo;
  trackingService: ITrackingService;
  trackingContext: TrackingContext;
};
