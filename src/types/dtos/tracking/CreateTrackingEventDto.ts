import z from 'zod';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';

export const CreateTrackingEventSchema = z.object({
  eventType: z.enum(EventTypeEnum),
  userId: z.uuid(),
  organizationId: z.uuid().nullable(),
  resourceType: z.enum(EventResourceTypeEnum),
  resourceId: z.string().uuid(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable()
});

export type CreateTrackingEventDto = z.infer<typeof CreateTrackingEventSchema>
