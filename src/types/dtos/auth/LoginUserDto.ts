import { IUserRepo } from 'src/repos/user.repo';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export type LoginUserDto = {
  userRepo: IUserRepo;
  email: string;
  password: string;
  cognitoService: ICognitoService;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
  userEmail: string;
};
