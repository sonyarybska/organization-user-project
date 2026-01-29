import { joinUserToOrganization } from 'src/controllers/invites/join-to-organization';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { createTestInvite } from 'src/tests/fixtures/test-factories';

describe('joinUserToOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should throw when token is invalid', async () => {
    const testInvite = createTestInvite();
    mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValueOnce(
      testInvite
    );
    mockHmacService.validateToken.mockReturnValueOnce(false);

    const transactionService = {
      run: jest.fn(async (cb: any) => cb({ entityManager: {} as any }))
    };

    await expect(
      joinUserToOrganization({
        token: testInvite.token,
        userOrganizationRepo: mockUserOrganizationRepo,
        organizationInviteRepo: mockOrganizationInviteRepo,
        userRepo: mockUserRepo,
        cognitoService: mockCognitoService,
        transactionService,
        hmacService: mockHmacService
      })
    ).rejects.toThrow('Invalid invite token');

    expect(transactionService.run).not.toHaveBeenCalled();
  });

  it('should join existing user to organization and mark invite accepted', async () => {
    const testInvite = createTestInvite({
      expiresAt: new Date('2026-02-01T00:00:00.000Z')
    });

    const connection = { entityManager: {} as any };

    const transactionService = {
      run: jest.fn(async (cb: any) => cb(connection))
    };

    mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValueOnce(
      testInvite
    );
    mockHmacService.validateToken.mockReturnValueOnce(true);

    mockUserRepo.getByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: testInvite.email
    } as any);

    await joinUserToOrganization({
      token: testInvite.token,
      userOrganizationRepo: mockUserOrganizationRepo,
      organizationInviteRepo: mockOrganizationInviteRepo,
      userRepo: mockUserRepo,
      cognitoService: mockCognitoService,
      transactionService,
      hmacService: mockHmacService
    });

    expect(transactionService.run).toHaveBeenCalledTimes(1);

    expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: testInvite.organizationId,
      role: UserRoleEnum.USER
    });

    expect(mockOrganizationInviteRepo.reconnect).toHaveBeenCalledWith(
      connection
    );
    expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(
      testInvite.id,
      InviteStatus.ACCEPTED
    );

    expect(mockCognitoService.createCognitoUser).not.toHaveBeenCalled();
    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });

  it('should create user in transaction when not exists', async () => {
    const testInvite = createTestInvite({
      expiresAt: new Date('2026-02-01T00:00:00.000Z')
    });
    const connection = { entityManager: {} as any };

    const transactionService = {
      run: jest.fn(async (cb: any) => cb(connection))
    };

    mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValueOnce(
      testInvite
    );
    mockHmacService.validateToken.mockReturnValueOnce(true);

    mockUserRepo.getByEmail.mockResolvedValueOnce(null as any);
    mockCognitoService.createCognitoUser.mockResolvedValueOnce('cognito-1');

    mockUserRepo.create.mockResolvedValueOnce({
      id: 'new-user-1',
      email: testInvite.email,
      cognitoUserId: 'cognito-1'
    } as any);

    await joinUserToOrganization({
      token: testInvite.token,
      userOrganizationRepo: mockUserOrganizationRepo,
      organizationInviteRepo: mockOrganizationInviteRepo,
      userRepo: mockUserRepo,
      cognitoService: mockCognitoService,
      transactionService,
      hmacService: mockHmacService
    });

    expect(mockCognitoService.createCognitoUser).toHaveBeenCalledWith(
      testInvite.email
    );

    expect(mockUserRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockUserRepo.create).toHaveBeenCalledWith({
      email: testInvite.email,
      cognitoUserId: 'cognito-1'
    });

    expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
      userId: 'new-user-1',
      organizationId: testInvite.organizationId,
      role: UserRoleEnum.USER
    });

    expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(
      testInvite.id,
      InviteStatus.ACCEPTED
    );
  });
});
