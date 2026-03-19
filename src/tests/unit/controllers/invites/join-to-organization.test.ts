import { joinUserToOrganization } from 'src/controllers/invites/join-to-organization';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { TEST_TOKENS, TEST_EMAILS, TEST_USER_IDS, TEST_IDS, TEST_DATES, TEST_ORG_IDS } from 'src/tests/fixtures/test-constants';

describe('joinUserToOrganization', () => {
  const mockConnection = { entityManager: {} as any };
  const mockTransactionService = {
    run: jest.fn(async (cb: any) => cb(mockConnection))
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on invalid token', () => {
    it('rejects join attempt', async () => {
      const testInvite = createTestInvite({
        token: TEST_TOKENS.INVITE_TOKEN,
        expiresAt: TEST_DATES.FUTURE
      });
      mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValue(testInvite);
      mockHmacService.validateToken.mockReturnValue(false);

      await expect(
        joinUserToOrganization({
          token: TEST_TOKENS.INVITE_TOKEN,
          userOrganizationRepo: mockUserOrganizationRepo,
          organizationInviteRepo: mockOrganizationInviteRepo,
          userRepo: mockUserRepo,
          cognitoService: mockCognitoService,
          transactionService: mockTransactionService,
          hmacService: mockHmacService
        })
      ).rejects.toThrow('Invalid invite token');

      expect(mockTransactionService.run).not.toHaveBeenCalled();
    });
  });

  describe('on existing user', () => {
    it('adds user to organization and marks invite accepted', async () => {
      const testInvite = createTestInvite({
        token: TEST_TOKENS.INVITE_TOKEN,
        email: TEST_EMAILS.VALID_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        expiresAt: TEST_DATES.FUTURE
      });

      mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValue(testInvite);
      mockHmacService.validateToken.mockReturnValue(true);
      mockUserRepo.getByEmail.mockResolvedValue({
        id: TEST_USER_IDS.FIRST,
        email: TEST_EMAILS.VALID_USER
      } as any);

      await joinUserToOrganization({
        token: TEST_TOKENS.INVITE_TOKEN,
        userOrganizationRepo: mockUserOrganizationRepo,
        organizationInviteRepo: mockOrganizationInviteRepo,
        userRepo: mockUserRepo,
        cognitoService: mockCognitoService,
        transactionService: mockTransactionService,
        hmacService: mockHmacService
      });

      expect(mockTransactionService.run).toHaveBeenCalledTimes(1);

      expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.FIRST,
        organizationId: TEST_ORG_IDS.FIRST,
        role: UserRoleEnum.USER
      });

      expect(mockOrganizationInviteRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(testInvite.id, InviteStatus.ACCEPTED);

      expect(mockCognitoService.createCognitoUser).not.toHaveBeenCalled();
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('on new user', () => {
    it('creates user in cognito and database, then adds to organization', async () => {
      const testInvite = createTestInvite({
        token: TEST_TOKENS.INVITE_TOKEN,
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        expiresAt: TEST_DATES.FUTURE
      });

      mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValue(testInvite);
      mockHmacService.validateToken.mockReturnValue(true);
      mockUserRepo.getByEmail.mockResolvedValue(null as any);
      mockCognitoService.createCognitoUser.mockResolvedValue(TEST_IDS.COGNITO_1);
      mockUserRepo.create.mockResolvedValue({
        id: TEST_USER_IDS.SECOND,
        email: TEST_EMAILS.INVITED_USER,
        cognitoUserId: TEST_IDS.COGNITO_1
      } as any);

      await joinUserToOrganization({
        token: TEST_TOKENS.INVITE_TOKEN,
        userOrganizationRepo: mockUserOrganizationRepo,
        organizationInviteRepo: mockOrganizationInviteRepo,
        userRepo: mockUserRepo,
        cognitoService: mockCognitoService,
        transactionService: mockTransactionService,
        hmacService: mockHmacService
      });

      expect(mockCognitoService.createCognitoUser).toHaveBeenCalledWith(TEST_EMAILS.INVITED_USER);

      expect(mockUserRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: TEST_EMAILS.INVITED_USER,
        cognitoUserId: TEST_IDS.COGNITO_1
      });

      expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.SECOND,
        organizationId: TEST_ORG_IDS.FIRST,
        role: UserRoleEnum.USER
      });

      expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(testInvite.id, InviteStatus.ACCEPTED);
    });
  });
});
