import { getInvitesByEmail } from 'src/controllers/invites/get-invites-by-email';
import { getInvitesByOrganizationId } from 'src/controllers/invites/get-invites-by-organization-id';
import { createTestInvite } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { TEST_EMAILS, TEST_ORG_IDS } from 'src/tests/fixtures/test-constants';

describe('getInvites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvitesByEmail', () => {
    it('retrieves invites for email address', async () => {
      const testInvite = createTestInvite({ email: TEST_EMAILS.INVITED_USER });
      mockOrganizationInviteRepo.getByEmail.mockResolvedValue([testInvite]);

      const result = await getInvitesByEmail({
        email: TEST_EMAILS.INVITED_USER,
        organizationInviteRepo: mockOrganizationInviteRepo
      });

      expect(mockOrganizationInviteRepo.getByEmail).toHaveBeenCalledWith(TEST_EMAILS.INVITED_USER);
      expect(result).toEqual([testInvite]);
    });
  });

  describe('getInvitesByOrganizationId', () => {
    it('retrieves all invites for organization', async () => {
      const testInvite = createTestInvite({ organizationId: TEST_ORG_IDS.FIRST });
      mockOrganizationInviteRepo.getByOrganizationId.mockResolvedValue([testInvite]);

      const result = await getInvitesByOrganizationId({
        organizationId: TEST_ORG_IDS.FIRST,
        organizationInviteRepo: mockOrganizationInviteRepo
      });

      expect(mockOrganizationInviteRepo.getByOrganizationId).toHaveBeenCalledWith(TEST_ORG_IDS.FIRST);
      expect(result).toEqual([testInvite]);
    });
  });
});
