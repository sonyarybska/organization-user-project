import { randomUUID } from 'crypto';
import { CreateAttachmentDto } from 'src/types/dtos/attachment/CreateAttachmentDto';

const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function createAttachment({
  s3Service,
  attachmentRepo,
  attachmentData: { userId, originalName, buffer }
}: CreateAttachmentDto) {
  const publicKey = `attachments/${userId}/${randomUUID()}-${originalName}`;
  const key = `public/${publicKey}`;

  await s3Service.upload(key, buffer, bucket);

  const { id }  = await attachmentRepo.create({
    originalName,
    key,
    publicKey,
    userId,
    fileSizeInBytes: buffer.length
  });

  return { id };
}
