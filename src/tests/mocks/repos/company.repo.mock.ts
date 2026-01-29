import { jest } from '@jest/globals';
import { ICompanyRepo } from 'src/repos/company.repo';

export const mockCompanyRepo: jest.Mocked<ICompanyRepo> = {
  reconnect: jest.fn(),
  create: jest.fn(),
  upsert: jest.fn(),
  getByIdAndOrganizationId: jest.fn(),
  updateByIdAndOrganizationId: jest.fn(),
  deleteByIdAndOrganizationId: jest.fn()
};

mockCompanyRepo.reconnect.mockImplementation(() => mockCompanyRepo);

