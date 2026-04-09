import { createOrganizationInvite } from 'src/controllers/invites/create-organization-invite';
import {
  TEST_TOKENS,
  TEST_USER_IDS,
  TEST_EMAILS,
  TEST_ORG_IDS,
  TEST_ORG_NAMES,
  TEST_TRACKING_CONTEXT
} from 'src/tests/fixtures/test-constants';
import { createTestInvite, createTestOrganization } from 'src/tests/fixtures/test-factories';
import { mockOrganizationInviteRepo } from 'src/tests/mocks/repos/organization-invite.repo.mock';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockSqsService } from 'src/tests/mocks/services/sqs.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';

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
    it('creates invite record and sends email when user does not exist', async () => {
      const testInvite = createTestInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST
      });

      mockOrganizationRepo.getByIdAndUserId.mockResolvedValue(testOrganization);
      mockOrganizationInviteRepo.createInvite.mockResolvedValue(testInvite);
      mockHmacService.getSignature.mockReturnValue(TEST_TOKENS.INVITE_TOKEN);
      mockSendGridService.sendInviteEmail.mockResolvedValue();
      mockUserRepo.getByEmail.mockResolvedValue(null);

      await createOrganizationInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.ADMIN,
        sendGridService: mockSendGridService,
        organizationInviteRepo: mockOrganizationInviteRepo,
        organizationRepo: mockOrganizationRepo,
        hmacService: mockHmacService,
        trackingContext: TEST_TRACKING_CONTEXT,
        trackingService: trackingServiceMock,
        userEmail: TEST_EMAILS.ADMIN,
        userRepo: mockUserRepo,
        sqsService: mockSqsService
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

      expect(trackingServiceMock.track).toHaveBeenCalledWith({
        eventType: expect.any(String),
        resourceType: expect.any(String),
        resourceId: testInvite.id,
        userEmail: TEST_EMAILS.ADMIN,
        organizationId: TEST_ORG_IDS.FIRST,
        trackingContext: TEST_TRACKING_CONTEXT
      });

      expect(mockSqsService.sendMessageToQueue).not.toHaveBeenCalled();
    });

    it('creates invite and notification when user already exists', async () => {
      const testInvite = createTestInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST
      });

      const existingUser = {
        id: TEST_USER_IDS.FIRST,
        email: TEST_EMAILS.INVITED_USER
      };

      mockOrganizationRepo.getByIdAndUserId.mockResolvedValue(testOrganization);
      mockOrganizationInviteRepo.createInvite.mockResolvedValue(testInvite);
      mockHmacService.getSignature.mockReturnValue(TEST_TOKENS.INVITE_TOKEN);
      mockSendGridService.sendInviteEmail.mockResolvedValue();
      mockUserRepo.getByEmail.mockResolvedValue(existingUser as any);
      mockSqsService.sendMessageToQueue.mockResolvedValue({} as any);

      await createOrganizationInvite({
        email: TEST_EMAILS.INVITED_USER,
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.ADMIN,
        sendGridService: mockSendGridService,
        organizationInviteRepo: mockOrganizationInviteRepo,
        organizationRepo: mockOrganizationRepo,
        hmacService: mockHmacService,
        userRepo: mockUserRepo,
        sqsService: mockSqsService,
        trackingContext: TEST_TRACKING_CONTEXT,
        trackingService: trackingServiceMock,
        userEmail: TEST_EMAILS.ADMIN
      });

      expect(mockUserRepo.getByEmail).toHaveBeenCalledWith(TEST_EMAILS.INVITED_USER);

      expect(trackingServiceMock.track).toHaveBeenCalledWith({
        eventType: expect.any(String),
        resourceType: expect.any(String),
        resourceId: testInvite.id,
        userEmail: TEST_EMAILS.ADMIN,
        organizationId: TEST_ORG_IDS.FIRST,
        trackingContext: TEST_TRACKING_CONTEXT
      });

      expect(mockSqsService.sendMessageToQueue).toHaveBeenCalledWith(process.env.AWS_SQS_NOTIFICATION_QUEUE_URL, {
        userId: existingUser.id,
        organizationId: TEST_ORG_IDS.FIRST,
        type: NotificationTypeEnum.InviteReceived,
        title: 'New Invite',
        message: `You've been invited to join ${TEST_ORG_NAMES.TECH_CORP}`
      });
    });
  });
});
