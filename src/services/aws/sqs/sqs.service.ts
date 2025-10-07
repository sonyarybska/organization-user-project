import { SQS } from '@aws-sdk/client-sqs';

export interface ISqsService {
  sendMessageToQueue: (queueUrl: string, message: any) => Promise<void>
}

export function getAwsSqsService(region: string): ISqsService {
  const sqs = new SQS({ region });

  return {
    async sendMessageToQueue(queueUrl: string, message: any): Promise<void> {
      await sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message)
      });
    }
  };
}
