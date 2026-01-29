import { createTestCsvImportRecord } from 'src/tests/fixtures/test-factories';
import { mockCsvImportRecordRepo } from 'src/tests/mocks/repos/csv-import-record.repo.mock';
import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockSqsService } from 'src/tests/mocks/services/sqs.service.mock';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { v4 as uuid } from 'uuid';

describe('importProspectsFromCsv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload csv, create import record and enqueue SQS message', async () => {
    const {
      importProspectsFromCsv
    } = require('src/controllers/csv-import-record/import-prospects-from-csv');
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const testCsvImportRecord = createTestCsvImportRecord();

    const buffer = Buffer.from(
      'email,firstName\n' + 'john@test.com,John\n' + 'jane@test.com,Jane\n'
    );

    mockCsvImportRecordRepo.create.mockResolvedValueOnce(testCsvImportRecord);

    const result = await importProspectsFromCsv({
      s3Service: mockS3Service,
      sqsService: mockSqsService,
      csvImportRecordRepo: mockCsvImportRecordRepo,
      buffer,
      mapping: { email: 'email', firstName: 'firstName' },
      organizationId: testCsvImportRecord.organizationId,
      userId: testCsvImportRecord.userId
    });

    const expectedKey = `csv-imports/${testCsvImportRecord.organizationId}/${testCsvImportRecord.userId}/1700000000000.csv`;

    expect(mockS3Service.upload).toHaveBeenCalledWith(
      expectedKey,
      buffer,
      process.env.AWS_S3_BUCKET_NAME
    );

    expect(mockCsvImportRecordRepo.create).toHaveBeenCalledWith({
      key: expectedKey,
      organizationId: testCsvImportRecord.organizationId,
      userId: testCsvImportRecord.userId,
      totalRows: 2,
      status: CsvImportStatusEnum.NEW
    });

    expect(mockSqsService.sendMessageToQueue).toHaveBeenCalledWith(
      process.env.AWS_SQS_START_CSV_IMPORT_QUEUE_URL,
      {
        importRecordId: testCsvImportRecord.id,
        mapping: { email: 'email', firstName: 'firstName' },
        userId: testCsvImportRecord.userId,
        organizationId: testCsvImportRecord.organizationId,
        key: expectedKey
      }
    );

    expect(result).toEqual({ csvImportRecordId: testCsvImportRecord.id });
  });

  it('should throw on S3 upload failure', async () => {
    const {
      importProspectsFromCsv
    } = require('src/controllers/csv-import-record/import-prospects-from-csv');
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const buffer = Buffer.from('email\njohn@test.com\n');

    mockS3Service.upload.mockRejectedValueOnce(new Error('S3 error'));

    await expect(
      importProspectsFromCsv({
        s3Service: mockS3Service,
        sqsService: mockSqsService,
        csvImportRecordRepo: mockCsvImportRecordRepo,
        buffer,
        mapping: { email: 'email' },
        organizationId: uuid(),
        userId: uuid()
      })
    ).rejects.toThrow('S3 error');

    expect(mockCsvImportRecordRepo.create).not.toHaveBeenCalled();
    expect(mockSqsService.sendMessageToQueue).not.toHaveBeenCalled();
  });

  it('should throw on SQS send failure', async () => {
    const {
      importProspectsFromCsv
    } = require('src/controllers/csv-import-record/import-prospects-from-csv');
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const defaultCsvImportRecord = createTestCsvImportRecord();

    const buffer = Buffer.from('email\njohn@test.com\n');

    mockCsvImportRecordRepo.create.mockResolvedValueOnce(defaultCsvImportRecord);

    mockSqsService.sendMessageToQueue.mockRejectedValueOnce(
      new Error('SQS error')
    );

    await expect(
      importProspectsFromCsv({
        s3Service: mockS3Service,
        sqsService: mockSqsService,
        csvImportRecordRepo: mockCsvImportRecordRepo,
        buffer,
        mapping: { email: 'email' },
        organizationId: uuid(),
        userId: uuid()
      })
    ).rejects.toThrow('SQS error');
  });
});
