import { CreateCompanyDto } from 'src/types/dtos/company/CreateCompanyDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

export async function createCompany({
  companyData,
  companyRepo,
  userId,
  organizationId,
  trackingContext,
  trackingService
}: CreateCompanyDto) {
  const company = await companyRepo.create(companyData);

  trackingService.track({
    eventType: EventTypeEnum.CompanyCreated,
    resourceType: EventResourceTypeEnum.Company,
    resourceId: company.id,
    userId,
    organizationId,
    trackingContext
  });

  return company;
}
