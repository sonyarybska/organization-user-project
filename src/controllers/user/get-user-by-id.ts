import { GetUserRes } from 'src/api/routes/users/schemas/GetUserResSchema';
import { GetUserByIdDto } from 'src/types/dtos/user/GetUserByIdDto';

export async function getUserById({
  userId,
  userRepo,
  s3Service,
  expireInSeconds
}: GetUserByIdDto): Promise<GetUserRes> {
  const result = await userRepo.getById(userId);

  return {
    ...result,
    avatar: result.avatar
      ? {
          id: result.avatarId,
          url: await s3Service.getSignedUrl(result.avatar.key, expireInSeconds)
        }
      : null
  };
}
