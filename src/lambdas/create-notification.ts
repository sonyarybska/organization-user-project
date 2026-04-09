/* eslint-disable no-console */
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { getDb } from 'src/services/typeorm/typeorm.service';
import { getNotificationRepo } from 'src/repos/notification.repo';
import { CreateNotificationMessageDto } from 'src/types/dtos/notification/CreateNotificationMessageDto';

export const handler: SQSHandler = async (event: SQSEvent) => {
  if (!event.Records.length) {
    return;
  }

  const db = await getDb({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    dbName: process.env.PGDATABASE,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD
  });

  const notificationRepo = getNotificationRepo(db);

  for (const record of event.Records) {
    try {
      const notificationData = JSON.parse(record.body) as CreateNotificationMessageDto;

      if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
        throw new Error('Missing required fields in the message');
      }

      await notificationRepo.create(notificationData);

      console.log(`Notification created for user ${notificationData.userId}, type: ${notificationData.type}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error creating notification:', errorMessage);
      throw error;
    }
  }
};
