import { createOrganization } from 'src/controllers/organization/create-organization';
import { createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { TEST_USER_IDS, TEST_ORG_NAMES, TEST_TRACKING_CONTEXT, TEST_EMAILS } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('createOrganization', () => {
  const mockConnection = { entityManager: {} as any };
  const mockTransactionService = {
    run: jest.fn(async (cb: any) => cb(mockConnection))
  };

  const organizationData = { name: TEST_ORG_NAMES.TECH_CORP };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful creation', () => {
    it('creates organization and assigns user as admin in transaction', async () => {
      const testOrganization = createTestOrganization({ name: TEST_ORG_NAMES.TECH_CORP });
      mockOrganizationRepo.create.mockResolvedValue(testOrganization);

      const result = await createOrganization({
        userId: TEST_USER_IDS.FIRST,
        organizationData,
        organizationRepo: mockOrganizationRepo,
        userOrganizationRepo: mockUserOrganizationRepo,
        transactionService: mockTransactionService,
        trackingService: trackingServiceMock,
        trackingContext: TEST_TRACKING_CONTEXT,
        userEmail: TEST_EMAILS.VALID_USER
      });

      expect(mockTransactionService.run).toHaveBeenCalledTimes(1);

      expect(mockOrganizationRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockOrganizationRepo.create).toHaveBeenCalledWith(organizationData);

      expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.FIRST,
        organizationId: testOrganization.id,
        role: UserRoleEnum.ADMIN
      });

      expect(result).toEqual(testOrganization);
    });
  });

  describe('on transaction failure', () => {
    it('rolls back when organization creation fails', async () => {
      const dbError = new Error('Organization name already exists');
      mockOrganizationRepo.create.mockRejectedValue(dbError);

      await expect(
        createOrganization({
          userId: TEST_USER_IDS.FIRST,
          organizationData,
          organizationRepo: mockOrganizationRepo,
          userOrganizationRepo: mockUserOrganizationRepo,
          transactionService: mockTransactionService,
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT,
          userEmail: TEST_EMAILS.VALID_USER
        })
      ).rejects.toThrow('Organization name already exists');

      expect(mockUserOrganizationRepo.create).not.toHaveBeenCalled();
    });
  });
});
