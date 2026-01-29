import { createOrganization } from 'src/controllers/organization/create-organization';
import { createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { v4 as uuid } from 'uuid';

describe('createOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should create organization and assign admin role', async () => {
    const testOrganization = createTestOrganization();
    const userId = uuid();

    const connection = { entityManager: {} as any };
    const transactionService = {
      run: jest.fn(async (cb) => cb(connection))
    };

    mockOrganizationRepo.create.mockResolvedValueOnce(testOrganization);

    const result = await createOrganization({
      userId,
      organizationData: { name: testOrganization.name },
      organizationRepo: mockOrganizationRepo,
      userOrganizationRepo: mockUserOrganizationRepo,
      transactionService
    });

    expect(transactionService.run).toHaveBeenCalledTimes(1);

    expect(mockOrganizationRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockOrganizationRepo.create).toHaveBeenCalledWith({
      name: testOrganization.name
    });

    expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
      userId,
      organizationId: testOrganization.id,
      role: UserRoleEnum.ADMIN
    });

    expect(result).toEqual({ ...testOrganization, name: testOrganization.name });
  });

  it('should throw if db error occurs during creation', async () => {
    const connection = { entityManager: {} as any };

    const transactionService = {
      run: jest.fn(async (cb: any) => cb(connection))
    };

    mockOrganizationRepo.create.mockRejectedValueOnce(new Error('DB error'));

    await expect(
      createOrganization({
        userId: 'user-123',
        organizationData: { name: 'Acme' },
        organizationRepo: mockOrganizationRepo,
        userOrganizationRepo: mockUserOrganizationRepo,
        transactionService
      })
    ).rejects.toThrow('DB error');

    expect(mockUserOrganizationRepo.create).not.toHaveBeenCalled();
  });
});
