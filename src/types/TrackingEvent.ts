import z from 'zod';
import { EventTypeEnum } from './enums/EventTypeEnum';
import { EventResourceTypeEnum } from './enums/EventResourceTypeEnum';

export const TrackingEventSchema = z.object({
  id: z.uuid(),
  eventType: z.enum(EventTypeEnum),
  userId: z.uuid().nullable(),
  organizationId: z.uuid().nullable(),
  resourceType: z.enum(EventResourceTypeEnum).nullable(),
  resourceId: z.uuid().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date()
});

export type TrackingEvent = z.infer<typeof TrackingEventSchema>
