import { UserResSchema } from 'src/api/common/schemas/UserResSchema';
import { GetUserByIdDto } from 'src/types/dtos/user/GetUserByIdDto';

const expireInSeconds = Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC);
const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function getUserById({
  userId,
  userRepo,
  s3Service
}: GetUserByIdDto) {
  const result = await userRepo.getById(userId);

  return UserResSchema.parse(
   {
    ...result,
    avatar: result.avatar
      ? {
          id: result.avatarId,
          url: await s3Service.getSignedUrl(
            result.avatar.key,
            expireInSeconds,
            bucket
          )
        }
      : undefined
  });
}
