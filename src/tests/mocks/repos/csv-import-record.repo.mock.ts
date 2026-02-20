import { jest } from '@jest/globals';
import { ICsvImportRecordRepo } from 'src/repos/csv-import-record.repo';

export const mockCsvImportRecordRepo: jest.Mocked<ICsvImportRecordRepo> = {
  reconnect: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  incrementProcessedRows: jest.fn(),
  handleImportError: jest.fn(),
  checkIfDone: jest.fn(),
  incrementSkippedDuplicationRows: jest.fn()
};

mockCsvImportRecordRepo.reconnect.mockImplementation(() => mockCsvImportRecordRepo);

