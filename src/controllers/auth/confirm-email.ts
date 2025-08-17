import { ConfirmEmailDto } from 'src/types/dtos/auth/ConfirmEmailDto';
import { JwtPayload } from 'src/types/JwtPayload';

export async function confirmEmail({ userRepo, token, jwt }: ConfirmEmailDto) {
  jwt.verify(token);

  const { id } = jwt.decode(token) as JwtPayload;

  const user = await userRepo.getById(id);

  await userRepo.updateUser(user.id, { isConfirm: true });
}
