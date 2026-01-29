import { jest } from '@jest/globals';
import { IOrganizationInviteRepo } from 'src/repos/organization-invite.repo';

export const mockOrganizationInviteRepo: jest.Mocked<IOrganizationInviteRepo> = {
  reconnect: jest.fn(),
  createInvite: jest.fn(),
  updateStatusById: jest.fn(),
  getValidPendingByToken: jest.fn(),
  getByIdAndOrganizationId: jest.fn(),
  getByOrganizationId: jest.fn(),
  getByEmail: jest.fn()
};

mockOrganizationInviteRepo.reconnect.mockImplementation(() => mockOrganizationInviteRepo);

