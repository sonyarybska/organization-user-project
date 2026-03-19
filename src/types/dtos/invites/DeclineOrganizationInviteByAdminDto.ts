import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export type DeclineOrganizationInviteByAdminDto = {
  inviteId: string;
  organizationId: string;
  organizationInviteRepo: IOrganizationInviteRepo;
  status: InviteStatus;
  userId: string;
  trackingService: ITrackingService;
  trackingContext: TrackingContext;
};
