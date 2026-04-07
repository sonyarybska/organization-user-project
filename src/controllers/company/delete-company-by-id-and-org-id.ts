import { DeleteCompanyByIdAndOrgIdDto } from 'src/types/dtos/company/DeleteCompanyByIdAndOrgIdDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function deleteCompanyByIdAndOrgId({
  id,
  organizationId,
  companyRepo,
  userEmail,
  trackingContext,
  trackingService
}: DeleteCompanyByIdAndOrgIdDto) {
  await companyRepo.deleteByIdAndOrganizationId(id, organizationId);

  trackingService.track({
    eventType: EventTypeEnum.CompanyDeleted,
    resourceType: EventResourceTypeEnum.Company,
    resourceId: id,
    userEmail,
    organizationId,
    trackingContext
  });
}
