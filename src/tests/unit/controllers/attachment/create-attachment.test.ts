import { createTestAttachment } from 'src/tests/fixtures/test-factories';
import { mockAttachmentRepo } from 'src/tests/mocks/repos/attachment.repo.mock';
import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { createAttachment } from 'src/controllers/attachment/create-attachment';
import { v4 as uuid } from 'uuid';

describe('createAttachment', () => {
  const MOCK_UUID = 'uuid-1';

  beforeEach(async () => {
    jest.doMock('crypto', () => ({
      randomUUID: jest.fn(() => MOCK_UUID)
    }));

    jest.clearAllMocks();
  });

  it('should upload file to S3 and create attachment record', async () => {
    const testAttachment = createTestAttachment();
    const userId = uuid();

    mockAttachmentRepo.create.mockResolvedValue(createTestAttachment());
    const result = await createAttachment({
      s3Service: mockS3Service,
      attachmentRepo: mockAttachmentRepo,
      attachmentData: {
        userId,
        originalName: testAttachment.originalName,
        buffer: Buffer.from('file-content')
      }
    });

    expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
    expect(mockS3Service.upload).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`^public/attachments/${userId}/.+-test-file\\.txt$`)
      ),
      Buffer.from('file-content'),
      process.env.AWS_S3_BUCKET_NAME
    );

    expect(mockAttachmentRepo.create).toHaveBeenCalledTimes(1);
    expect(mockAttachmentRepo.create).toHaveBeenCalledWith({
      originalName: testAttachment.originalName,
      key: expect.stringMatching(
        new RegExp(`^public/attachments/${userId}/.+-test-file\\.txt$`)
      ),
      publicKey: expect.stringMatching(
        new RegExp(`^attachments/${userId}/.+-test-file\\.txt$`)
      ),
      userId
    });

    expect(result).toEqual({ id: expect.any(String) });
  });

  it('should throw on S3 upload failure', async () => {
    const attachmentData = createTestAttachment();
    const s3Error = new Error('S3 upload failed');
    mockS3Service.upload.mockRejectedValueOnce(s3Error);

    await expect(
      createAttachment({
        s3Service: mockS3Service,
        attachmentRepo: mockAttachmentRepo,
        attachmentData: {
          ...attachmentData,
          buffer: Buffer.from('file-content')
        }
      })
    ).rejects.toThrow('S3 upload failed');

    expect(mockAttachmentRepo.create).not.toHaveBeenCalled();
  });

  it('should throw on database create failure', async () => {
    const attachmentData = createTestAttachment();
    const dbError = new Error('Database connection failed');
    mockAttachmentRepo.create.mockRejectedValueOnce(dbError);

    await expect(
      createAttachment({
        s3Service: mockS3Service,
        attachmentRepo: mockAttachmentRepo,
        attachmentData: {
          ...attachmentData,
          buffer: Buffer.from('file-content')
        }
      })
    ).rejects.toThrow('Database connection failed');

    expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
  });
});
