import { IAttachmentRepo } from 'src/repos/attachment.repo';
import { IS3Service } from 'src/services/aws/s3/s3.service';

export type CreateAttachmentDto = {
  attachmentRepo: IAttachmentRepo
  s3Service: IS3Service
  attachmentData: {
    originalName: string
    userId: string
    buffer: Buffer
  }
}
