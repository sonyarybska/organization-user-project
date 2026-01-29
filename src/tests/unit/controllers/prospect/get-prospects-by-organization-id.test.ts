import { getProspectsByOrganizationId } from 'src/controllers/prospect/get-prospects-by-organization-id';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';
import { v4 as uuid } from 'uuid';

describe('getProspectsByOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return paginated organization prospects', async () => {
    const organizationId = uuid();
    const testProspect1 = createTestProspect({ organizationId });
    const testProspect2 = createTestProspect({ organizationId });

    mockProspectRepo.getByOrganizationId.mockResolvedValueOnce({
      prospects: [testProspect1, testProspect2],
      count: 2
    });

    const result = await getProspectsByOrganizationId({
      organizationId,
      prospectRepo: mockProspectRepo
    });

    expect(mockProspectRepo.getByOrganizationId).toHaveBeenCalledWith(
      organizationId
    );
    expect(result).toEqual({
      prospects: [testProspect1, testProspect2],
      count: 2
    });
  });

  it('should throw if db error', async () => {
    const organizationId = uuid();
    mockProspectRepo.getByOrganizationId.mockRejectedValueOnce(
      new DBError('DB error')
    );

    await expect(
      getProspectsByOrganizationId({
        organizationId,
        prospectRepo: mockProspectRepo
      })
    ).rejects.toThrow('DB error');
  });
});
