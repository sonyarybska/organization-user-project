import { ICsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';
import { ISqsService } from 'src/services/aws/sqs/sqs.service';

export type ImportProspectsFromCsvDto = {
  s3Service: IS3Service
  buffer: Buffer
  mapping: Record<string, string>
  organizationId: string
  userId: string
  csvImportRecordRepo: ICsvImportRecordRepo
  sqsService: ISqsService
}
