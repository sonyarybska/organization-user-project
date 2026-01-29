import { deleteProspectsByIdAndOrganizationId } from 'src/controllers/prospect/delete-prospects-by-id-and-organization-id';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';
import { v4 as uuid } from 'uuid';

describe('deleteProspectsByIdAndOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call prospectRepo.deleteByIdAndOrganizationId with correct args', async () => {
    const prospectId = uuid();
    const organizationId = uuid();
    await deleteProspectsByIdAndOrganizationId({
      id: prospectId,
      organizationId,
      prospectRepo: mockProspectRepo
    });

    expect(mockProspectRepo.deleteByIdAndOrganizationId).toHaveBeenCalledWith(
      prospectId,
      organizationId
    );
  });

  it('should throw if db error', async () => {
    mockProspectRepo.deleteByIdAndOrganizationId.mockRejectedValueOnce(
      new DBError('DB error')
    );

    await expect(
      deleteProspectsByIdAndOrganizationId({
        id: uuid(),
        organizationId: uuid(),
        prospectRepo: mockProspectRepo
      })
    ).rejects.toThrow('DB error');
  });
});
