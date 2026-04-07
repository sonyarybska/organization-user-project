import { DeclineOrganizationInviteByAdminDto } from 'src/types/dtos/invites/DeclineOrganizationInviteByAdminDto';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { ApplicationError } from 'src/types/errors/ApplicationError';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';

export async function declineOrganizationInviteByAdmin({
  inviteId,
  organizationInviteRepo,
  status,
  organizationId,
  userEmail,
  trackingService,
  trackingContext
}: DeclineOrganizationInviteByAdminDto) {
  const invite = await organizationInviteRepo.getByIdAndOrganizationId(inviteId, organizationId);

  if (invite.expiresAt < new Date()) {
    throw new ApplicationError('Invite has expired');
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new ApplicationError('Invite is already accepted or declined');
  }

  await organizationInviteRepo.updateStatusById(inviteId, status);

  trackingService.track({
    eventType: EventTypeEnum.InviteDeclined,
    resourceType: EventResourceTypeEnum.Invite,
    resourceId: inviteId,
    userEmail,
    organizationId,
    trackingContext
  });
}
