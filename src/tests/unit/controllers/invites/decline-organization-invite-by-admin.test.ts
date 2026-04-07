import { declineOrganizationInviteByAdmin } from 'src/controllers/invites/decline-organization-invite-by-admin';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { TEST_DATES, TEST_EMAILS, TEST_ORG_IDS, TEST_TRACKING_CONTEXT } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('declineOrganizationInviteByAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on expired invite', () => {
    it('rejects decline attempt', async () => {
      const expiredInvite = createTestInvite({
        expiresAt: TEST_DATES.PAST,
        organizationId: TEST_ORG_IDS.FIRST
      });
      mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValue(expiredInvite);

      await expect(
        declineOrganizationInviteByAdmin({
          inviteId: expiredInvite.id,
          organizationId: TEST_ORG_IDS.FIRST,
          organizationInviteRepo: mockOrganizationInviteRepo,
          status: InviteStatus.DECLINED_BY_ADMIN,
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT,
          userEmail: TEST_EMAILS.VALID_USER
        })
      ).rejects.toThrow('Invite has expired');

      expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
    });
  });

  describe('on non-pending invite', () => {
    it('rejects decline attempt for already processed invite', async () => {
      const acceptedInvite = createTestInvite({
        expiresAt: TEST_DATES.FUTURE,
        status: InviteStatus.ACCEPTED,
        organizationId: TEST_ORG_IDS.FIRST
      });
      mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValue(acceptedInvite);

      await expect(
        declineOrganizationInviteByAdmin({
          inviteId: acceptedInvite.id,
          organizationId: TEST_ORG_IDS.FIRST,
          organizationInviteRepo: mockOrganizationInviteRepo,
          status: InviteStatus.DECLINED_BY_ADMIN,
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT,
          userEmail: TEST_EMAILS.VALID_USER
        })
      ).rejects.toThrow('Invite is already accepted or declined');

      expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
    });
  });

  describe('on valid pending invite', () => {
    it('updates status to declined by admin', async () => {
      const validInvite = createTestInvite({
        expiresAt: TEST_DATES.FUTURE,
        status: InviteStatus.PENDING,
        organizationId: TEST_ORG_IDS.FIRST
      });
      mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValue(validInvite);

      await declineOrganizationInviteByAdmin({
        inviteId: validInvite.id,
        organizationId: TEST_ORG_IDS.FIRST,
        organizationInviteRepo: mockOrganizationInviteRepo,
        status: InviteStatus.DECLINED_BY_ADMIN,
        trackingService: trackingServiceMock,
        trackingContext: TEST_TRACKING_CONTEXT,
        userEmail: TEST_EMAILS.VALID_USER
      });

      expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(validInvite.id, InviteStatus.DECLINED_BY_ADMIN);
    });
  });
});
