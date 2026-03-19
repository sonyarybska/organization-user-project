import { declineOrganizationInvite } from 'src/controllers/invites/decline-organization-invite';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';

describe('declineOrganizationInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on invalid token', () => {
    it('rejects decline attempt', async () => {
      const testInvite = createTestInvite({ token: TEST_TOKENS.INVITE_TOKEN });
      mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValue(testInvite);
      mockHmacService.validateToken.mockReturnValue(false);

      await expect(
        declineOrganizationInvite({
          token: TEST_TOKENS.INVITE_TOKEN,
          organizationInviteRepo: mockOrganizationInviteRepo,
          status: InviteStatus.DECLINED_BY_USER,
          hmacService: mockHmacService
        })
      ).rejects.toThrow('Invalid invite token');

      expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
    });
  });

  describe('on valid token', () => {
    it('updates invite status to declined', async () => {
      const testInvite = createTestInvite({ token: TEST_TOKENS.INVITE_TOKEN });
      mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValue(testInvite);
      mockHmacService.validateToken.mockReturnValue(true);

      await declineOrganizationInvite({
        token: TEST_TOKENS.INVITE_TOKEN,
        organizationInviteRepo: mockOrganizationInviteRepo,
        status: InviteStatus.DECLINED_BY_USER,
        hmacService: mockHmacService
      });

      expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(testInvite.id, InviteStatus.DECLINED_BY_USER);
    });
  });
});
