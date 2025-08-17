import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface IS3Service {
  upload: (key: string, body: Buffer | string) => Promise<void>;
  getSignedUrl: (key: string, expiresIn: number) => Promise<string>;
}

export function getAwsS3Service(region: string, bucketName: string): IS3Service {
  const client = new S3Client({
    region
  });

  return {
    async upload(key: string, body: Buffer | string): Promise<void> {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body
      });

      await client.send(command);
    },

    async getSignedUrl (key: string, expiresIn: number): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      return await getSignedUrl(client, command, { expiresIn });
    }
  };
}
