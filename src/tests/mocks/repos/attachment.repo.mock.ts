import { IAttachmentRepo } from 'src/repos/attachment.repo';
import { jest } from '@jest/globals';

export const mockAttachmentRepo: jest.Mocked<IAttachmentRepo> = {
  create: jest.fn(),
  reconnect: jest.fn()
};

mockAttachmentRepo.reconnect.mockImplementation(() => mockAttachmentRepo);