import { jest } from '@jest/globals';
import { IOrganizationRepo } from 'src/repos/organization.repo';

export const mockOrganizationRepo: jest.Mocked<IOrganizationRepo> = {
  reconnect: jest.fn(),
  create: jest.fn(),
  getByIdAndUserId: jest.fn(),
  getByUserId: jest.fn()
};

mockOrganizationRepo.reconnect.mockImplementation(() => mockOrganizationRepo);

