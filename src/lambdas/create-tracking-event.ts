/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getTrackingEventRepo } from 'src/repos/tracking-event.repo';
import { CreateTrackingEventSchema } from 'src/types/schemas/CreateTrackingEventSchema';

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!event.Records.length) {
    console.log('No records to process');
    return;
  }

  const db = await getDb({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    dbName: process.env.PGDATABASE,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD
  });

  const trackingEventRepo = getTrackingEventRepo(db);

  for (const record of event.Records) {
    try {
      const parsedBody = JSON.parse(record.body);

      const validation = CreateTrackingEventSchema.safeParse(parsedBody);

      if (!validation.success) {
        console.error('Invalid tracking event format:', validation.error.message);
        continue;
      }

      const trackingEvent = validation.data;

      await trackingEventRepo.create(trackingEvent);
    } catch (error) {
      console.error('Failed to process tracking event:', error);
    }
  }

  await db.destroy();
};
