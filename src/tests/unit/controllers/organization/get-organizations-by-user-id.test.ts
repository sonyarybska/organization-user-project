import { getOrganizationsByUserId } from 'src/controllers/organization/get-organizations-by-user-id';
import { createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { TEST_USER_IDS } from 'src/tests/fixtures/test-constants';

describe('getOrganizationsByUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful retrieval', () => {
    it('returns all organizations for user', async () => {
      const testOrganization1 = createTestOrganization();
      const testOrganization2 = createTestOrganization();

      mockOrganizationRepo.getByUserId.mockResolvedValue([
        testOrganization1,
        testOrganization2
      ]);

      const result = await getOrganizationsByUserId({
        userId: TEST_USER_IDS.FIRST,
        organizationRepo: mockOrganizationRepo
      });

      expect(mockOrganizationRepo.getByUserId).toHaveBeenCalledWith(TEST_USER_IDS.FIRST);
      expect(result).toEqual([testOrganization1, testOrganization2]);
    });
  });

  describe('on retrieval failure', () => {
    it('propagates database error', async () => {
      const dbError = new Error('User not found');
      mockOrganizationRepo.getByUserId.mockRejectedValue(dbError);

      await expect(
        getOrganizationsByUserId({
          userId: TEST_USER_IDS.FIRST,
          organizationRepo: mockOrganizationRepo
        })
      ).rejects.toThrow('User not found');
    });
  });
});
