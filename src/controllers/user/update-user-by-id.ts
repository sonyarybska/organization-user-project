import { UpdateUserDto } from 'src/types/dtos/user/UpdateUserDto';

export async function updateUserById(data: UpdateUserDto) {
  const { userRepo } = data;
  await userRepo.updateUser(data.userId, data.userData);
}
