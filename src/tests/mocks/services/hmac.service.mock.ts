import { jest } from '@jest/globals';
import { IHMACService } from 'src/services/hmac/hmac.service';

export const mockHmacService: jest.Mocked<IHMACService> = {
  getSignature: jest.fn(),
  validateToken: jest.fn()
};
