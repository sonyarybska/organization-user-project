import { jest } from '@jest/globals';
import { ICognitoService } from 'src/services/aws/cognito/cognito.service';

export const mockCognitoService: jest.Mocked<ICognitoService> = {
  getCognitoUserInfoByAccessToken: jest.fn(),
  createCognitoUser: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn()
};
