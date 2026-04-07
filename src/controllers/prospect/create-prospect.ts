import { CreateProspectDto } from 'src/types/dtos/prospect/CreateProspectDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function createProspect({
  data,
  prospectRepo,
  userEmail,
  organizationId,
  trackingContext,
  trackingService
}: CreateProspectDto) {
  const prospect = await prospectRepo.create(data);

  trackingService.track({
    eventType: EventTypeEnum.ProspectCreated,
    resourceType: EventResourceTypeEnum.Prospect,
    resourceId: prospect.id,
    userEmail,
    organizationId,
    trackingContext
  });

  return { id: prospect.id };
}
