import { jest } from '@jest/globals';
import { IUserOrganizationRepo } from 'src/repos/user-organization.repo';

export const mockUserOrganizationRepo: jest.Mocked<IUserOrganizationRepo> = {
  reconnect: jest.fn(),
  create: jest.fn()
};

mockUserOrganizationRepo.reconnect.mockImplementation(() => mockUserOrganizationRepo);
