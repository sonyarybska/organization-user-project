import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApplicationError } from 'src/types/errors/ApplicationError';

export interface IS3Service {
  upload: (
    key: string,
    body: Buffer | string,
    bucketName: string,
  ) => Promise<void>
  getSignedUrl: (
    key: string,
    expiresIn: number,
    bucketName: string,
  ) => Promise<string>
  getFile: (key: string, bucket: string) => Promise<GetObjectCommandOutput>
}

export function getAwsS3Service(region: string): IS3Service {
  const client = new S3Client({
    region
  });

  return {
    async upload(
      key: string,
      body: Buffer | string,
      bucketName: string
    ): Promise<void> {
      try {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body
        });

        await client.send(command);
      } catch (error) {
        throw new ApplicationError('Failed to upload file to S3', error);
      }
    },

    async getSignedUrl(
      key: string,
      expiresIn: number,
      bucketName: string
    ): Promise<string> {
      try {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        return await getSignedUrl(client, command, { expiresIn });
      } catch (error) {
        throw new ApplicationError('Failed to get signed URL from S3', error);
      }
    },

    async getFile(
      key: string,
      bucket: string
    ): Promise<GetObjectCommandOutput> {
      try {
        const file = await client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key
          })
        );

        return file;
      } catch (error) {
        throw new ApplicationError((error as any).message, error);
      }
    }
  };
}
