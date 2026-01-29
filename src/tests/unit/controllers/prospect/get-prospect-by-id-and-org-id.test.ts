import { getProspectByIdAndOrgId } from 'src/controllers/prospect/get-prospect-by-id-and-org-id';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';
import { v4 as uuid } from 'uuid';

describe('getProspectByIdAndOrgId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return the prospect by id and organization id', async () => {
    const testProspect1 = createTestProspect();

    mockProspectRepo.getByIdAndOrganizationId.mockResolvedValueOnce(
      testProspect1
    );

    const result = await getProspectByIdAndOrgId({
      id: testProspect1.id,
      organizationId: testProspect1.organizationId,
      prospectRepo: mockProspectRepo
    });

    expect(mockProspectRepo.getByIdAndOrganizationId).toHaveBeenCalledWith(
      testProspect1.id,
      testProspect1.organizationId
    );
    expect(result).toBe(testProspect1);
  });

  it('should throw if db error', async () => {
    mockProspectRepo.getByIdAndOrganizationId.mockRejectedValueOnce(
      new DBError('DB error')
    );

    await expect(
      getProspectByIdAndOrgId({
        id: uuid(),
        organizationId: uuid(),
        prospectRepo: mockProspectRepo
      })
    ).rejects.toThrow('DB error');
  });
});
