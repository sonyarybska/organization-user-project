import { TrackingEventEntity } from 'src/services/typeorm/entities/TrackingEventEntity';
import { TrackingEvent } from 'src/types/TrackingEvent';
import { CreateTrackingEventDto } from 'src/types/dtos/tracking/CreateTrackingEventDto';
import { DBError } from 'src/types/errors/DBError';
import { DataSource, EntityManager } from 'typeorm';

export interface ITrackingEventRepo {
  create(data: CreateTrackingEventDto): Promise<TrackingEvent>;
}

export function getTrackingEventRepo(db: DataSource | EntityManager): ITrackingEventRepo {
  const trackingEventRepo = db.getRepository<TrackingEventEntity>(TrackingEventEntity);

  return {
    async create(data: CreateTrackingEventDto): Promise<TrackingEvent> {
      try {
        const result = await trackingEventRepo
          .createQueryBuilder('trackingEvent')
          .insert()
          .values(data as TrackingEventEntity)
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError('Failed to create tracking event');
        }

        return result.raw[0];
      } catch (error) {
        throw new DBError('Failed to create tracking event', error);
      }
    }
  };
}
