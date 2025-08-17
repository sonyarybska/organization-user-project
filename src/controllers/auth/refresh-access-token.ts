import { JWT } from '@fastify/jwt';
import { JwtTokens } from 'src/types/JwtTokens';

export async function refreshAccessToken(
  jwt: JWT,
  refreshToken?: string
): Promise<JwtTokens> {
  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  jwt.verify(refreshToken);

  const accessToken = jwt.sign({}, { expiresIn: '5h' });
  const newRefreshToken = jwt.sign({}, { expiresIn: '7d' });

  return { accessToken, refreshToken: newRefreshToken };
}
