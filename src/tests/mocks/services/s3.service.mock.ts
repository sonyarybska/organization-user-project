import { jest } from '@jest/globals';
import { IS3Service } from 'src/services/aws/s3/s3.service';

export const mockS3Service: jest.Mocked<IS3Service> = {
  upload: jest.fn(),
  getSignedUrl: jest.fn(),
  getFile: jest.fn()
};
