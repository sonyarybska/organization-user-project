import { z } from 'zod';

export const AttachmentSchema = z.object({
  id: z.uuid(),
  originalName: z.string(),
  key: z.string(),
  publicKey: z.string(),
  userId: z.uuid()
});

export type Attachment = z.infer<typeof AttachmentSchema>;
