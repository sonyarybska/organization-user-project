import { declineOrganizationInvite } from 'src/controllers/invites/decline-organization-invite';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

describe('declineOrganizationInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should throw on invalid token', async () => {
    const testInvite = createTestInvite();

    mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValueOnce(
      testInvite
    );
    mockHmacService.validateToken.mockReturnValueOnce(false);

    await expect(
      declineOrganizationInvite({
        token: testInvite.token,
        organizationInviteRepo: mockOrganizationInviteRepo,
        status: InviteStatus.DECLINED_BY_USER,
        hmacService: mockHmacService
      })
    ).rejects.toThrow('Invalid invite token');

    expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
  });

  it('should update invite status on valid token', async () => {
    const testInvite = createTestInvite();
    mockOrganizationInviteRepo.getValidPendingByToken.mockResolvedValueOnce(
      testInvite
    );
    mockHmacService.validateToken.mockReturnValueOnce(true);

    await declineOrganizationInvite({
      token: testInvite.token,
      organizationInviteRepo: mockOrganizationInviteRepo,
      status: InviteStatus.DECLINED_BY_USER,
      hmacService: mockHmacService
    });

    expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(
      testInvite.id,
      InviteStatus.DECLINED_BY_USER
    );
  });
});
