import { getInvitesByEmail } from 'src/controllers/invites/get-invites-by-email';
import { getInvitesByOrganizationId } from 'src/controllers/invites/get-invites-by-organization-id';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';

describe('getInvites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call repo when getting invites by email', async () => {
    const testInvite = createTestInvite();

    mockOrganizationInviteRepo.getByEmail.mockResolvedValueOnce([testInvite]);

    const result = await getInvitesByEmail({
      email: testInvite.email,
      organizationInviteRepo: mockOrganizationInviteRepo
    });

    expect(mockOrganizationInviteRepo.getByEmail).toHaveBeenCalledWith(
      'invite@test.com'
    );
    expect(result).toEqual([testInvite]);
  });

  it('should call repo when getting invites by organization id', async () => {
    const testInvite = createTestInvite();
    mockOrganizationInviteRepo.getByOrganizationId.mockResolvedValueOnce([
      testInvite
    ]);

    const result = await getInvitesByOrganizationId({
      organizationId: testInvite.organizationId,
      organizationInviteRepo: mockOrganizationInviteRepo
    });

    expect(mockOrganizationInviteRepo.getByOrganizationId).toHaveBeenCalledWith(
      testInvite.organizationId
    );
    expect(result).toEqual([testInvite]);
  });
});
