import z from 'zod';

export const AttachmentResSchema = z.object({
  id: z.uuid(),
  url: z.url()
});