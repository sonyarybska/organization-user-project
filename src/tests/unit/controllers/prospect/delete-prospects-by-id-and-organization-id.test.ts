import { deleteProspectsByIdAndOrganizationId } from 'src/controllers/prospect/delete-prospects-by-id-and-organization-id';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';

describe('deleteProspectsByIdAndOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful deletion', () => {
    it('deletes prospect by id and organization', async () => {
      const testProspect = createTestProspect();

      await deleteProspectsByIdAndOrganizationId({
        id: testProspect.id,
        organizationId: testProspect.organizationId,
        prospectRepo: mockProspectRepo
      });

      expect(mockProspectRepo.deleteByIdAndOrganizationId).toHaveBeenCalledWith(
        testProspect.id,
        testProspect.organizationId
      );
    });
  });

  describe('on deletion failure', () => {
    it('propagates database error', async () => {
      const testProspect = createTestProspect();
      const dbError = new DBError('Foreign key constraint');
      mockProspectRepo.deleteByIdAndOrganizationId.mockRejectedValue(dbError);

      await expect(
        deleteProspectsByIdAndOrganizationId({
          id: testProspect.id,
          organizationId: testProspect.organizationId,
          prospectRepo: mockProspectRepo
        })
      ).rejects.toThrow('Foreign key constraint');
    });
  });
});
