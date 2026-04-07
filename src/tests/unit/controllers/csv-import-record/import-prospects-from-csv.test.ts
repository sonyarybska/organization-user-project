import { importProspectsFromCsv } from 'src/controllers/csv-import-record/import-prospects-from-csv';
import { createTestCsvImportRecord } from 'src/tests/fixtures/test-factories';
import { mockCsvImportRecordRepo } from 'src/tests/mocks/repos/csv-import-record.repo.mock';
import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockSqsService } from 'src/tests/mocks/services/sqs.service.mock';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { TEST_USER_IDS, TEST_ORG_IDS, TEST_TRACKING_CONTEXT, TEST_EMAILS } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('importProspectsFromCsv', () => {
  const MOCK_TIMESTAMP = 1700000000000;
  const csvMapping = { email: 'email', firstName: 'firstName' };

  const sampleCsvBuffer = Buffer.from('email,firstName\n' + 'john@test.com,John\n' + 'jane@test.com,Jane\n');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(MOCK_TIMESTAMP);
  });

  describe('on successful import', () => {
    it('uploads CSV to S3, creates import record, and enqueues processing', async () => {
      const testCsvImportRecord = createTestCsvImportRecord({
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.FIRST
      });
      const expectedKey = `csv-imports/${TEST_ORG_IDS.FIRST}/${TEST_USER_IDS.FIRST}/${MOCK_TIMESTAMP}.csv`;

      mockCsvImportRecordRepo.create.mockResolvedValue(testCsvImportRecord);

      const result = await importProspectsFromCsv({
        s3Service: mockS3Service,
        sqsService: mockSqsService,
        csvImportRecordRepo: mockCsvImportRecordRepo,
        buffer: sampleCsvBuffer,
        mapping: csvMapping,
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.FIRST,
        trackingContext: TEST_TRACKING_CONTEXT,
        trackingService: trackingServiceMock,
        userEmail: TEST_EMAILS.VALID_USER
      });

      expect(mockS3Service.upload).toHaveBeenCalledWith(expectedKey, sampleCsvBuffer, process.env.AWS_S3_BUCKET_NAME);

      expect(mockCsvImportRecordRepo.create).toHaveBeenCalledWith({
        key: expectedKey,
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.FIRST,
        totalRows: 2,
        status: CsvImportStatusEnum.NEW
      });

      expect(mockSqsService.sendMessageToQueue).toHaveBeenCalledWith(process.env.AWS_SQS_START_CSV_IMPORT_QUEUE_URL, {
        importRecordId: testCsvImportRecord.id,
        mapping: csvMapping,
        userId: TEST_USER_IDS.FIRST,
        organizationId: TEST_ORG_IDS.FIRST,
        key: expectedKey
      });

      expect(result).toEqual({ csvImportRecordId: testCsvImportRecord.id });
    });
  });

  describe('on S3 upload failure', () => {
    it('propagates error without creating import record', async () => {
      const s3Error = new Error('Connection timeout');
      const singleRowCsv = Buffer.from('email\njohn@test.com\n');
      mockS3Service.upload.mockRejectedValue(s3Error);

      await expect(
        importProspectsFromCsv({
          s3Service: mockS3Service,
          sqsService: mockSqsService,
          csvImportRecordRepo: mockCsvImportRecordRepo,
          buffer: singleRowCsv,
          mapping: { email: 'email' },
          organizationId: TEST_ORG_IDS.FIRST,
          userId: TEST_USER_IDS.FIRST,
          trackingContext: TEST_TRACKING_CONTEXT,
          trackingService: trackingServiceMock,
          userEmail: TEST_EMAILS.VALID_USER
        })
      ).rejects.toThrow('Connection timeout');

      expect(mockCsvImportRecordRepo.create).not.toHaveBeenCalled();
      expect(mockSqsService.sendMessageToQueue).not.toHaveBeenCalled();
    });
  });

  describe('on SQS queue failure', () => {
    it('propagates error after creating import record', async () => {
      const testCsvImportRecord = createTestCsvImportRecord({
        organizationId: TEST_ORG_IDS.FIRST,
        userId: TEST_USER_IDS.FIRST
      });
      const singleRowCsv = Buffer.from('email\njohn@test.com\n');
      const sqsError = new Error('Queue unavailable');

      mockS3Service.upload.mockResolvedValue(undefined);
      mockCsvImportRecordRepo.create.mockResolvedValue(testCsvImportRecord);
      mockSqsService.sendMessageToQueue.mockRejectedValue(sqsError);

      await expect(
        importProspectsFromCsv({
          s3Service: mockS3Service,
          sqsService: mockSqsService,
          csvImportRecordRepo: mockCsvImportRecordRepo,
          buffer: singleRowCsv,
          mapping: { email: 'email' },
          organizationId: TEST_ORG_IDS.FIRST,
          userId: TEST_USER_IDS.FIRST,
          trackingContext: TEST_TRACKING_CONTEXT,
          trackingService: trackingServiceMock,
          userEmail: TEST_EMAILS.VALID_USER
        })
      ).rejects.toThrow('Queue unavailable');
    });
  });
});
