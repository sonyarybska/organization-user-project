import { getProspectsByOrganizationId } from 'src/controllers/prospect/get-prospects-by-organization-id';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { TEST_ORG_IDS } from 'src/tests/fixtures/test-constants';
import { DBError } from 'src/types/errors/DBError';

describe('getProspectsByOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful retrieval', () => {
    it('returns paginated prospects for organization', async () => {
      const testProspect1 = createTestProspect({ organizationId: TEST_ORG_IDS.FIRST });
      const testProspect2 = createTestProspect({ organizationId: TEST_ORG_IDS.FIRST });

      mockProspectRepo.getByOrganizationId.mockResolvedValue({
        prospects: [testProspect1, testProspect2],
        count: 2
      });

      const result = await getProspectsByOrganizationId({
        organizationId: TEST_ORG_IDS.FIRST,
        prospectRepo: mockProspectRepo
      });

      expect(mockProspectRepo.getByOrganizationId).toHaveBeenCalledWith(TEST_ORG_IDS.FIRST);
      expect(result).toEqual({
        prospects: [testProspect1, testProspect2],
        count: 2
      });
    });
  });

  describe('on retrieval failure', () => {
    it('propagates database error', async () => {
      const dbError = new DBError('Connection lost');
      mockProspectRepo.getByOrganizationId.mockRejectedValue(dbError);

      await expect(
        getProspectsByOrganizationId({
          organizationId: TEST_ORG_IDS.FIRST,
          prospectRepo: mockProspectRepo
        })
      ).rejects.toThrow('Connection lost');
    });
  });
});
