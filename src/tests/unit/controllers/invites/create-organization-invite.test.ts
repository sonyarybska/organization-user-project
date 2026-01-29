import { createOrganizationInvite } from 'src/controllers/invites/create-organization-invite';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';
import {
  createTestInvite,
  createTestOrganization
} from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { v4 as uuid } from 'uuid';

describe('createOrganizationInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create invite and send email', async () => {
    const testOrganization = createTestOrganization();
    const testOrganizationInvite = createTestInvite({
      organizationId: testOrganization.id
    });
    const userId = uuid();
    const token = TEST_TOKENS.INVITE_TOKEN;

    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);

    mockOrganizationRepo.getByIdAndUserId.mockResolvedValueOnce(
      testOrganization
    );
    mockOrganizationInviteRepo.createInvite.mockResolvedValueOnce(
      testOrganizationInvite
    );
    mockHmacService.getSignature.mockReturnValueOnce(token);
    mockSendGridService.sendInviteEmail.mockResolvedValueOnce();

    await createOrganizationInvite({
      email: testOrganizationInvite.email,
      organizationId: testOrganizationInvite.organizationId,
      userId,
      sendGridService: mockSendGridService,
      organizationInviteRepo: mockOrganizationInviteRepo,
      organizationRepo: mockOrganizationRepo,
      hmacService: mockHmacService
    });

    expect(mockOrganizationRepo.getByIdAndUserId).toHaveBeenCalledWith(
      testOrganizationInvite.organizationId,
      userId
    );

    expect(mockHmacService.getSignature).toHaveBeenCalledWith(
      expect.stringContaining(testOrganizationInvite.email),
      process.env.INVITE_TOKEN_SECRET
    );

    expect(mockOrganizationInviteRepo.createInvite).toHaveBeenCalledWith({
      email: testOrganizationInvite.email,
      organizationId: testOrganizationInvite.organizationId,
      expiresAt: expect.any(Date),
      token,
      status: InviteStatus.PENDING
    });

    expect(mockSendGridService.sendInviteEmail).toHaveBeenCalledWith(
      testOrganizationInvite.email,
      testOrganization.name,
      token
    );
  });
});
