import { createTestAttachment } from 'src/tests/fixtures/test-factories';
import { mockAttachmentRepo } from 'src/tests/mocks/repos/attachment.repo.mock';
import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { createAttachment } from 'src/controllers/attachment/create-attachment';
import { TEST_ORG_IDS, TEST_TRACKING_CONTEXT, TEST_USER_IDS } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('createAttachment', () => {
  const testAttachment = createTestAttachment();
  const fileBuffer = Buffer.from('test file content');

  const getPathPattern = (userId: string) => new RegExp(`^public/attachments/${userId}/.+-test-file\\.txt$`);
  const getPublicKeyPattern = (userId: string) => new RegExp(`^attachments/${userId}/.+-test-file\\.txt$`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful upload', () => {
    it('uploads file to S3 and creates database record', async () => {
      const createdAttachment = createTestAttachment();
      mockAttachmentRepo.create.mockResolvedValue(createdAttachment);

      const result = await createAttachment({
        s3Service: mockS3Service,
        attachmentRepo: mockAttachmentRepo,
        attachmentData: {
          userId: TEST_USER_IDS.FIRST,
          originalName: testAttachment.originalName,
          buffer: fileBuffer
        },
        trackingService: trackingServiceMock,
        trackingContext: TEST_TRACKING_CONTEXT,
        organizationId: TEST_ORG_IDS.FIRST
      });

      expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.stringMatching(getPathPattern(TEST_USER_IDS.FIRST)),
        fileBuffer,
        process.env.AWS_S3_BUCKET_NAME
      );

      expect(mockAttachmentRepo.create).toHaveBeenCalledTimes(1);
      expect(mockAttachmentRepo.create).toHaveBeenCalledWith({
        originalName: testAttachment.originalName,
        key: expect.stringMatching(getPathPattern(TEST_USER_IDS.FIRST)),
        publicKey: expect.stringMatching(getPublicKeyPattern(TEST_USER_IDS.FIRST)),
        userId: TEST_USER_IDS.FIRST
      });

      expect(result).toEqual({ id: expect.any(String) });
    });
  });

  describe('on S3 failure', () => {
    it('propagates error without creating database record', async () => {
      const s3Error = new Error('Connection timeout');
      mockS3Service.upload.mockRejectedValue(s3Error);

      await expect(
        createAttachment({
          s3Service: mockS3Service,
          attachmentRepo: mockAttachmentRepo,
          attachmentData: {
            userId: TEST_USER_IDS.FIRST,
            originalName: testAttachment.originalName,
            buffer: fileBuffer
          },
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT,
          organizationId: TEST_ORG_IDS.FIRST
        })
      ).rejects.toThrow('Connection timeout');

      expect(mockAttachmentRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('on database failure', () => {
    it('propagates error after S3 upload', async () => {
      const dbError = new Error('Unique constraint violation');
      mockS3Service.upload.mockResolvedValue(undefined);
      mockAttachmentRepo.create.mockRejectedValue(dbError);

      await expect(
        createAttachment({
          s3Service: mockS3Service,
          attachmentRepo: mockAttachmentRepo,
          attachmentData: {
            userId: TEST_USER_IDS.FIRST,
            originalName: testAttachment.originalName,
            buffer: fileBuffer
          },
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT,
          organizationId: TEST_ORG_IDS.FIRST
        })
      ).rejects.toThrow('Unique constraint violation');

      expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
    });
  });
});
