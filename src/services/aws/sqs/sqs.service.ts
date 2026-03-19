import { SQS } from '@aws-sdk/client-sqs';

export interface ISqsService {
  sendMessageToQueue: <T>(queueUrl: string, message: T) => Promise<void>;
}

export function getAwsSqsService(region: string): ISqsService {
  const sqs = new SQS({ region });

  return {
    async sendMessageToQueue<T>(queueUrl: string, message: T): Promise<void> {
      await sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message)
      });
    }
  };
}
