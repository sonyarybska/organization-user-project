import { CreateOrganizationInviteDto } from 'src/types/dtos/organization/CreateOrganizationInviteDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { NotificationTypeEnum } from 'src/types/enums/NotificationTypeEnum';
import { CreateNotificationMessageDto } from 'src/types/dtos/notification/CreateNotificationMessageDto';

const inviteTokenExpireInMillis = Number(process.env.INVITE_TOKEN_EXPIRE_IN_MILLIS);

const inviteTokenSecret = process.env.INVITE_TOKEN_SECRET;

export async function createOrganizationInvite(data: CreateOrganizationInviteDto) {
  const {
    organizationRepo,
    organizationInviteRepo,
    sendGridService,
    hmacService,
    trackingService,
    trackingContext,
    userRepo,
    sqsService
  } = data;

  const { name: organizationName } = await organizationRepo.getByIdAndUserId(data.organizationId, data.userId);

  const expiresAt = new Date(Date.now() + inviteTokenExpireInMillis);

  const token = hmacService.getSignature(`${data.email}-${expiresAt}`, inviteTokenSecret);

  const invite = await organizationInviteRepo.createInvite({
    email: data.email,
    organizationId: data.organizationId,
    expiresAt,
    token,
    status: InviteStatus.PENDING
  });

  await sendGridService.sendInviteEmail(data.email, organizationName, token);

  trackingService.track({
    eventType: EventTypeEnum.InviteCreated,
    resourceType: EventResourceTypeEnum.Invite,
    resourceId: invite.id,
    userEmail: data.userEmail,
    organizationId: data.organizationId,
    trackingContext
  });

  const invitedUser = await userRepo.getByEmail(data.email);

  if (invitedUser) {
    await sqsService.sendMessageToQueue<CreateNotificationMessageDto>(process.env.AWS_SQS_NOTIFICATION_QUEUE_URL, {
      userId: invitedUser.id,
      organizationId: data.organizationId,
      type: NotificationTypeEnum.InviteReceived,
      title: 'New Invite',
      message: `You've been invited to join ${organizationName}`
    });
  }
}
