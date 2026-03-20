import z from 'zod';

export const ProspectScoreResSchema = z.object({
  score: z.number().int().min(0).max(10),
  reason: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string())
});
