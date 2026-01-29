import { declineOrganizationInviteByAdmin } from 'src/controllers/invites/decline-organization-invite-by-admin';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';

describe('declineOrganizationInviteByAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should throw when invite is expired', async () => {
    const testInvite = createTestInvite({ expiresAt: new Date('2020-01-01') });
    mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValueOnce(
      testInvite
    );

    await expect(
      declineOrganizationInviteByAdmin({
        inviteId: testInvite.id,
        organizationId: testInvite.organizationId,
        organizationInviteRepo: mockOrganizationInviteRepo,
        status: InviteStatus.DECLINED_BY_ADMIN
      })
    ).rejects.toThrow('Invite has expired');

    expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
  });

  it('should throw when invite is not pending', async () => {
    const testInvite = createTestInvite({
      expiresAt: new Date('2026-12-31'),
      status: InviteStatus.ACCEPTED
    });

    mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValueOnce(
      testInvite
    );

    await expect(
      declineOrganizationInviteByAdmin({
        inviteId: testInvite.id,
        organizationId: testInvite.organizationId,
        organizationInviteRepo: mockOrganizationInviteRepo,
        status: InviteStatus.DECLINED_BY_ADMIN
      })
    ).rejects.toThrow('Invite is already accepted or declined');

    expect(mockOrganizationInviteRepo.updateStatusById).not.toHaveBeenCalled();
  });

  it('should update status for valid invite', async () => {
    const testInvite = createTestInvite({
      expiresAt: new Date('2026-12-31'),
      status: InviteStatus.PENDING
    });
    mockOrganizationInviteRepo.getByIdAndOrganizationId.mockResolvedValueOnce(
      testInvite
    );

    await declineOrganizationInviteByAdmin({
      inviteId: testInvite.id,
      organizationId: testInvite.organizationId,
      organizationInviteRepo: mockOrganizationInviteRepo,
      status: InviteStatus.DECLINED_BY_ADMIN
    });

    expect(mockOrganizationInviteRepo.updateStatusById).toHaveBeenCalledWith(
      testInvite.id,
      InviteStatus.DECLINED_BY_ADMIN
    );
  });
});
