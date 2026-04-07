import { ISqsService } from 'src/services/aws/sqs/sqs.service';
import { CreateTrackingEventDto } from 'src/types/dtos/tracking/CreateTrackingEventDto';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';
import { FastifyBaseLogger } from 'fastify';

export interface ITrackingService {
  track(params: {
    eventType: EventTypeEnum;
    resourceType: EventResourceTypeEnum;
    resourceId: string;
    userId: string;
    organizationId: string | null;
    trackingContext: TrackingContext;
    sourceName?: string | null;
  }): void;
}

export function getTrackingService(sqsService: ISqsService, logger: FastifyBaseLogger): ITrackingService {
  const queueUrl = process.env.AWS_SQS_TRACKING_QUEUE_URL;

  return {
    track(params): void {
      sqsService
        .sendMessageToQueue<CreateTrackingEventDto>(queueUrl, {
          eventType: params.eventType,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          userId: params.userId,
          organizationId: params.organizationId,
          ipAddress: params.trackingContext.ipAddress,
          userAgent: params.trackingContext.userAgent,
          source: params.trackingContext.source,
          sourceName: params.sourceName ?? null
        })
        .catch((err) => {
          logger.error(err, 'Failed to track event');
        });
    }
  };
}
