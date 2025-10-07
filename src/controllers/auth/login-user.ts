import { LoginUserDto } from 'src/types/dtos/auth/LoginUserDto';
import { JwtTokens } from 'src/types/JwtTokens';

export async function loginUser({
  cognitoService,
  ...data
}: LoginUserDto): Promise<JwtTokens> {
  return await cognitoService.login(data.email, data.password);
}
