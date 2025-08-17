import { UpdateUserDto } from 'src/types/dtos/user/UpdateUserDto';

export async function updateUserById({
  data,
  userRepo,
  userId,
  s3Service,
  expireInSeconds
}: UpdateUserDto) {
 await userRepo.updateUser(userId, data);

  const result = await userRepo.getById(userId);

  return {
    ...result,
    avatar: result.avatar
      ? {
          id: result.avatarId,
         url: await s3Service.getSignedUrl(result.avatar.key, expireInSeconds)
        }: null
  };
}
