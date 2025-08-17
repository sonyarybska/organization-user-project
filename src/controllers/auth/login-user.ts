import bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/types/dtos/auth/LoginUserDto';
import { JwtTokens } from 'src/types/JwtTokens';

export async function loginUser({
  userRepo,
  data,
  jwt,
  accessTokenExpiresIn,
  refreshTokenExpiresIn
}: LoginUserDto): Promise<JwtTokens> {
  const { email, password } = data;

  const user = await userRepo.getByEmail(email!);

  const isPasswordMatched = await bcrypt.compare(password!, user.password);

  if (!isPasswordMatched) {
    throw new Error('Invalid email or password');
  }

  const accessToken = jwt.sign(
    { id: user.id },
    { expiresIn: accessTokenExpiresIn }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    { expiresIn: refreshTokenExpiresIn }
  );

  return { accessToken, refreshToken };
}
