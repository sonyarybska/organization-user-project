import { EventSourceEnum } from '../enums/EventSourceEnum';

export interface TrackingContext {
  ipAddress: string | null;
  userAgent: string | null;
  source: EventSourceEnum;
}
