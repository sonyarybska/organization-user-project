import { randomUUID } from 'crypto';
import { CreateAttachmentDto } from 'src/types/dtos/attachment/CreateAttachmentDto';
import { EventResourceTypeEnum } from 'src/types/enums/EventResourceTypeEnum';
import { EventTypeEnum } from 'src/types/enums/EventTypeEnum';

const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function createAttachment({
  s3Service,
  attachmentRepo,
  attachmentData: { userId, originalName, buffer },
  organizationId,
  trackingContext,
  trackingService,
  userEmail
}: CreateAttachmentDto) {
  const publicKey = `attachments/${userId}/${randomUUID()}-${originalName}`;
  const key = `public/${publicKey}`;

  await s3Service.upload(key, buffer, bucket);

  const { id } = await attachmentRepo.create({
    originalName,
    key,
    publicKey,
    userId
  });

  trackingService.track({
    eventType: EventTypeEnum.AttachmentUploaded,
    resourceType: EventResourceTypeEnum.Attachment,
    resourceId: id,
    userEmail,
    organizationId,
    trackingContext
  });

  return { id };
}
