import { getProspectByIdAndOrgId } from 'src/controllers/prospect/get-prospect-by-id-and-org-id';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { TEST_ORG_IDS } from 'src/tests/fixtures/test-constants';
import { DBError } from 'src/types/errors/DBError';

describe('getProspectByIdAndOrgId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful retrieval', () => {
    it('returns prospect matching id and organization', async () => {
      const testProspect = createTestProspect({ organizationId: TEST_ORG_IDS.FIRST });
      mockProspectRepo.getByIdAndOrganizationId.mockResolvedValue(testProspect);

      const result = await getProspectByIdAndOrgId({
        id: testProspect.id,
        organizationId: testProspect.organizationId,
        prospectRepo: mockProspectRepo
      });

      expect(mockProspectRepo.getByIdAndOrganizationId).toHaveBeenCalledWith(
        testProspect.id,
        testProspect.organizationId
      );
      expect(result).toBe(testProspect);
    });
  });

  describe('on retrieval failure', () => {
    it('propagates database error', async () => {
      const testProspect = createTestProspect();
      const dbError = new DBError('Prospect not found');
      mockProspectRepo.getByIdAndOrganizationId.mockRejectedValue(dbError);

      await expect(
        getProspectByIdAndOrgId({
          id: testProspect.id,
          organizationId: testProspect.organizationId,
          prospectRepo: mockProspectRepo
        })
      ).rejects.toThrow('Prospect not found');
    });
  });
});
