import z from 'zod';
import { EventTypeEnum } from './enums/EventTypeEnum';
import { EventResourceTypeEnum } from './enums/EventResourceTypeEnum';
import { EventSourceEnum } from './enums/EventSourceEnum';

export const TrackingEventSchema = z.object({
  id: z.uuid(),
  eventType: z.enum(EventTypeEnum),
  userId: z.uuid().nullable(),
  organizationId: z.uuid().nullable(),
  resourceType: z.enum(EventResourceTypeEnum).nullable(),
  resourceId: z.uuid().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  source: z.enum(EventSourceEnum).nullable(),
  sourceName: z.string().nullable(),
  createdAt: z.date()
});

export type TrackingEvent = z.infer<typeof TrackingEventSchema>;
