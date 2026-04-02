import { z } from 'zod';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventSourceEnum } from 'src/types/enums/EventSourceEnum';

export const CreateTrackingEventSchema = z.object({
  eventType: z.enum(EventTypeEnum),
  userId: z.uuid(),
  organizationId: z.uuid().nullable(),
  resourceType: z.enum(EventResourceTypeEnum),
  resourceId: z.string().uuid(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  source: z.enum(EventSourceEnum).nullable(),
  sourceName: z.string().nullable()
});
