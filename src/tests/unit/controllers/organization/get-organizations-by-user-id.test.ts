import { getOrganizationsByUserId } from 'src/controllers/organization/get-organizations-by-user-id';
import { createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { v4 as uuid } from 'uuid';

describe('getOrganizationsByUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call organizationRepo.getByUserId with correct args', async () => {
    const testOrganization1 = createTestOrganization();
    const testOrganization2 = createTestOrganization();
    const userId = uuid();

    mockOrganizationRepo.getByUserId.mockResolvedValueOnce([
      testOrganization1,
      testOrganization2
    ]);

    const result = await getOrganizationsByUserId({
      userId,
      organizationRepo: mockOrganizationRepo
    });

    expect(mockOrganizationRepo.getByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual([testOrganization1, testOrganization2]);
  });

  it('should throw if db error', async () => {
    mockOrganizationRepo.getByUserId.mockRejectedValueOnce(
      new Error('DB error')
    );

    await expect(
      getOrganizationsByUserId({
        userId: uuid(),
        organizationRepo: mockOrganizationRepo
      })
    ).rejects.toThrow('DB error');
  });
});
