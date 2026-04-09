import { ICsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { IProspectRepo } from 'src/repos/prospect.repo';
import { IOrganizationRepo } from 'src/repos/organization.repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';
import { ISqsService } from 'src/services/aws/sqs/sqs.service';
import { ITrackingService } from 'src/services/tracking/tracking.service';
import { TrackingContext } from 'src/types/interfaces/TrackingContext';

export type ImportProspectsFromCsvDto = {
  s3Service: IS3Service;
  buffer: Buffer;
  mapping: Record<string, string>;
  organizationId: string;
  userId: string;
  csvImportRecordRepo: ICsvImportRecordRepo;
  sqsService: ISqsService;
  trackingService: ITrackingService;
  trackingContext: TrackingContext;
  userEmail: string;
  prospectRepo: IProspectRepo;
  organizationRepo: IOrganizationRepo;
};
