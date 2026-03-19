import { createOrganizationInvite } from 'src/controllers/invites/create-organization-invite';
import { TEST_TOKENS, TEST_USER_IDS, TEST_EMAILS, TEST_ORG_IDS, TEST_ORG_NAMES } from 'src/tests/fixtures/test-constants';
import { createTestInvite, createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

describe('createOrganizationInvite', () => {
  const testOrganization = createTestOrganization({
    id: TEST_ORG_IDS.FIRST,
    name: TEST_ORG_NAMES.TECH_CORP
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.Date, 'now').mockReturnValue(1640000000000);
  });

  describe('on successful invite creation', () => {
    it('creates invite record and sends email', async () => {
      const testInvite = createTestInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST
      });

      mockOrganizationRepo.getByIdAndUserId.mockResolvedValue(testOrganization);
      mockOrganizationInviteRepo.createInvite.mockResolvedValue(testInvite);
      mockHmacService.getSignature.mockReturnValue(TEST_TOKENS.INVITE_TOKEN);
      mockSendGridService.sendInviteEmail.mockResolvedValue();

      await createOrganizationInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.ADMIN,
        sendGridService: mockSendGridService,
        organizationInviteRepo: mockOrganizationInviteRepo,
        organizationRepo: mockOrganizationRepo,
        hmacService: mockHmacService
      });

      expect(mockOrganizationRepo.getByIdAndUserId).toHaveBeenCalledWith(TEST_ORG_IDS.FIRST, TEST_USER_IDS.ADMIN);

      expect(mockHmacService.getSignature).toHaveBeenCalledWith(
        expect.stringContaining(TEST_EMAILS.INVITED_USER),
        process.env.INVITE_TOKEN_SECRET
      );

      expect(mockOrganizationInviteRepo.createInvite).toHaveBeenCalledWith({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        expiresAt: expect.any(Date),
        token: TEST_TOKENS.INVITE_TOKEN,
        status: InviteStatus.PENDING
      });

      expect(mockSendGridService.sendInviteEmail).toHaveBeenCalledWith(
        TEST_EMAILS.INVITED_USER,
        TEST_ORG_NAMES.TECH_CORP,
        TEST_TOKENS.INVITE_TOKEN
      );
    });
  });
});
