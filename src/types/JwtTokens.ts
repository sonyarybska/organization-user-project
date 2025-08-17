import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.jwt()
});

export const AccessTokenSchema = z.object({
  accessToken: z.jwt()
});

export const JwtTokensSchema = RefreshTokenSchema.merge(AccessTokenSchema);

export type JwtTokens = z.infer<typeof JwtTokensSchema>
