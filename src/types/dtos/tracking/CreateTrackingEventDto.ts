import z from 'zod';
import { CreateTrackingEventSchema } from 'src/types/schemas/CreateTrackingEventSchema';

export type CreateTrackingEventDto = z.infer<typeof CreateTrackingEventSchema>;
