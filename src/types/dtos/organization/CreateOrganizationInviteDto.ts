import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IHMACService } from 'src/services/hmac/hmac.service';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export type CreateOrganizationInviteDto = {
  email: string;
  organizationId: string;
  userId: string;
  sendGridService: ISendGridService;
  organizationInviteRepo: IOrganizationInviteRepo;
  organizationRepo: IOrganizationRepo;
  hmacService: IHMACService;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
};
