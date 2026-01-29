import { z } from 'zod';

export const EnvironmentSchema = z.object({
  TZ: z.string(),
  FRONT_URL: z.url(),
  NODE_ENV: z.string(),
  PORT: z.string(),
  HOST: z.string(),
  PGHOST: z.string(),
  PGPORT: z.string(),
  PGUSERNAME: z.string(),
  PGPASSWORD: z.string(),
  PGDATABASE: z.string(),
  TESTPGHOST: z.string(),
  TESTPGPORT: z.string(),
  TESTPGUSERNAME: z.string(),
  TESTPGPASSWORD: z.string(),
  TESTPGDATABASE: z.string(),
  INVITE_TOKEN_SECRET: z.string(),
  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string(),
  INVITE_TOKEN_EXPIRE_IN_MILLIS: z.string(),
  SENDGRID_ORGANIZATION_INVITE_TEMPLATE_ID: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SIGNED_URL_EXPIRE_IN_SEC: z.string(),
  AWS_SQS_START_CSV_IMPORT_QUEUE_URL: z.string(),
  AWS_SQS_PROCESS_CSV_ROW_QUEUE_URL: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_USER_POOL_ID: z.string()
});

export type Environment = z.infer<typeof EnvironmentSchema>
