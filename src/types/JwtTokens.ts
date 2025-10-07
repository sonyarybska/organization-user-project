import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
});

export const AccessTokenSchema = z.object({
  accessToken: z.string()
});

export const JwtTokensSchema = z.intersection(AccessTokenSchema, RefreshTokenSchema);

export type JwtTokens = z.infer<typeof JwtTokensSchema>
export type AccessToken = z.infer<typeof AccessTokenSchema>
