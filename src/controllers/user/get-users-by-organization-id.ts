import { GetUsersByOrganizationIdDto } from 'src/types/dtos/user/GetUsersByOrganizationIdDto';

const expireInSeconds = Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC);
const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function getUsersByOrganizationId({
  organizationId,
  userRepo,
  s3Service
}: GetUsersByOrganizationIdDto) {
  const users = await userRepo.getUsersByOrganizationId(organizationId);

  return Promise.all(
    users.map(async (user) => ({
      ...user,
      avatar: user.avatar
        ? { id:user.avatar.id, url: await s3Service.getSignedUrl(user.avatar.key, expireInSeconds, bucket) }
        : undefined
    }))
  );
}
