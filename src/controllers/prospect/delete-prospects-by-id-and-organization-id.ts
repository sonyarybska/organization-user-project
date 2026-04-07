import { DeleteProspectByIdAndOrganizationIdDto } from 'src/types/dtos/prospect/DeleteProspectByIdAndOrganizationId';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function deleteProspectsByIdAndOrganizationId({
  id,
  organizationId,
  prospectRepo,
  userId,
  trackingContext,
  trackingService
}: DeleteProspectByIdAndOrganizationIdDto) {
  await prospectRepo.deleteByIdAndOrganizationId(id, organizationId);

  trackingService.track({
    eventType: EventTypeEnum.ProspectDeleted,
    resourceType: EventResourceTypeEnum.Prospect,
    resourceId: id,
    userId,
    organizationId,
    trackingContext
  });
}
