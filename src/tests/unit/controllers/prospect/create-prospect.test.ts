import { createProspect } from 'src/controllers/prospect/create-prospect';
import { createTestProspect } from 'src/tests/fixtures/test-factories';
import { mockProspectRepo } from 'src/tests/mocks/repos/prospect.repo.mock';
import { DBError } from 'src/types/errors/DBError';

describe('createProspect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful creation', () => {
    it('persists prospect and returns id', async () => {
      const testProspect = createTestProspect();
      mockProspectRepo.create.mockResolvedValue(testProspect);

      const result = await createProspect({
        data: testProspect,
        prospectRepo: mockProspectRepo
      });

      expect(mockProspectRepo.create).toHaveBeenCalledWith(testProspect);
      expect(result).toEqual({ id: testProspect.id });
    });
  });

  describe('on creation failure', () => {
    it('propagates database error', async () => {
      const testProspect = createTestProspect();
      const dbError = new DBError('Unique constraint violation');
      mockProspectRepo.create.mockRejectedValue(dbError);

      await expect(
        createProspect({
          data: testProspect,
          prospectRepo: mockProspectRepo
        })
      ).rejects.toThrow('Unique constraint violation');
    });
  });
});
