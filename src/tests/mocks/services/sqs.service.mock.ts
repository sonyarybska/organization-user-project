import { jest } from '@jest/globals';
import { ISqsService } from 'src/services/aws/sqs/sqs.service';

export const mockSqsService: jest.Mocked<ISqsService> = {
  sendMessageToQueue: jest.fn()
};
