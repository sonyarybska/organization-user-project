import { jest } from '@jest/globals';
import { IUserRepo } from 'src/repos/user.repo';

export const mockUserRepo: jest.Mocked<IUserRepo> = {
  reconnect: jest.fn(),
  getUsersByOrganizationId: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  getByEmail: jest.fn(),
  updateUser: jest.fn(),
  getUserByCognitoUserId: jest.fn()
};

mockUserRepo.reconnect.mockImplementation(() => mockUserRepo);
