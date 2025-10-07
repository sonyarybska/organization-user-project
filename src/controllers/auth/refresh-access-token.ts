import { RefreshAccessTokenDto } from 'src/types/dtos/auth/RefreshAccessTokenDto';
import { AccessToken } from 'src/types/JwtTokens';

export async function refreshAccessToken({
  cognitoService,
  refreshToken
}: RefreshAccessTokenDto): Promise<AccessToken> {
  return await cognitoService.refreshAccessToken(refreshToken);
}
