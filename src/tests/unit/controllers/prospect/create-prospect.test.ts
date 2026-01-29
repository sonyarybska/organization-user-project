import { createProspect } from 'src/controllers/prospect/create-prospect';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';

describe('createProspect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a prospect', async () => {
    const testProspect = createTestProspect();

    mockProspectRepo.create.mockResolvedValueOnce(testProspect);

    const result = await createProspect({
      data: testProspect,
      prospectRepo: mockProspectRepo
    });

    expect(mockProspectRepo.create).toHaveBeenCalledWith(testProspect);
    expect(result).toEqual({ id: testProspect.id });
  });

  it('should throw if db error', async () => {
   const testProspect = createTestProspect();

    mockProspectRepo.create.mockRejectedValueOnce(new DBError('DB error'));

    await expect(
      createProspect({
        data: testProspect,
        prospectRepo: mockProspectRepo
      })
    ).rejects.toThrow('DB error');
  });
});
