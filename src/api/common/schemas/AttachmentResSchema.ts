import z from 'zod';

// if it's route schema then move to route folder
export const AttachmentResSchema = z.object({
  id: z.uuid(),
  url: z.url()
});