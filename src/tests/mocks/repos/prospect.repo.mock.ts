import { jest } from '@jest/globals';
import { IProspectRepo } from 'src/repos/prospect.repo';

export const mockProspectRepo: jest.Mocked<IProspectRepo> = {
  reconnect: jest.fn(),
  create: jest.fn(),
  getByOrganizationId: jest.fn(),
  getByIdAndOrganizationId: jest.fn(),
  deleteByIdAndOrganizationId: jest.fn(),
  getEmailsByOrganizationId: jest.fn()
};

mockProspectRepo.reconnect.mockImplementation(() => mockProspectRepo);

