import { IAttachmentRepo } from 'src/repos/attachment.repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export type CreateAttachmentDto = {
  attachmentRepo: IAttachmentRepo;
  s3Service: IS3Service;
  attachmentData: {
    originalName: string;
    userId: string;
    buffer: Buffer;
  };
  organizationId: string;
  trackingContext: TrackingContext;
  trackingService: ITrackingService;
  userEmail: string;
};
