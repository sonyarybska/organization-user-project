import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';
import { createTestUser } from 'src/tests/fixtures/test-factories';
import { DBError } from 'src/types/errors/DBError';
import { getUserById } from 'src/controllers/user/get-user-by-id';

describe('getUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return user with signed avatar url', async () => {
    const testUser = createTestUser();

    mockUserRepo.getById.mockResolvedValueOnce(testUser);

    mockS3Service.getSignedUrl.mockResolvedValueOnce(TEST_TOKENS.SIGNED_URL);

    const result = await getUserById({
      userId: testUser.id,
      userRepo: mockUserRepo,
      s3Service: mockS3Service
    });

    expect(mockUserRepo.getById).toHaveBeenCalledWith(testUser.id);
    expect(mockS3Service.getSignedUrl).toHaveBeenCalledWith(
      testUser.avatar!.key,
      Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC),
      process.env.AWS_S3_BUCKET_NAME
    );

    expect(result).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      avatarId: testUser.avatarId,
      avatar: {
        id: testUser.avatarId,
        url: TEST_TOKENS.SIGNED_URL
      }
    });
  });

  it('should throw if db error', async () => {
    const nonExistentUserId = 'non-existent-user-id';

    mockUserRepo.getById.mockRejectedValueOnce(new DBError('DB error'));

    await expect(
      getUserById({
        userId: nonExistentUserId,
        userRepo: mockUserRepo,
        s3Service: mockS3Service
      })
    ).rejects.toThrow('DB error');

    expect(mockUserRepo.getById).toHaveBeenCalledWith(nonExistentUserId);
  });
});
