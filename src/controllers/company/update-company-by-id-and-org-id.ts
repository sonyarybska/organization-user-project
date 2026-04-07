import { UpdateCompanyByIdAndOrgIdDto } from 'src/types/dtos/company/UpdateCompanyByIdAndOrgIdDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function updateCompanyByIdAndOrgId({
  id,
  organizationId,
  companyData,
  companyRepo,
  userEmail,
  trackingContext,
  trackingService
}: UpdateCompanyByIdAndOrgIdDto) {
  const company = await companyRepo.updateByIdAndOrganizationId(id, organizationId, companyData);

  trackingService.track({
    eventType: EventTypeEnum.CompanyUpdated,
    resourceType: EventResourceTypeEnum.Company,
    resourceId: id,
    userEmail,
    organizationId,
    trackingContext
  });

  return company;
}
