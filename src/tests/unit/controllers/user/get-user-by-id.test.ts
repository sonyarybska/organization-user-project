import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { TEST_TOKENS, TEST_USER_IDS } from 'src/tests/fixtures/test-constants';
import { createTestUser } from 'src/tests/fixtures/test-factories';
import { DBError } from 'src/types/errors/DBError';
import { getUserById } from 'src/controllers/user/get-user-by-id';

describe('getUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful retrieval', () => {
    it('returns user with signed avatar url', async () => {
      const testUser = createTestUser();
      mockUserRepo.getById.mockResolvedValue(testUser);
      mockS3Service.getSignedUrl.mockResolvedValue(TEST_TOKENS.SIGNED_URL);

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
  });

  describe('on retrieval failure', () => {
    it('propagates database error', async () => {
      const dbError = new DBError('User not found');
      mockUserRepo.getById.mockRejectedValue(dbError);

      await expect(
        getUserById({
          userId: TEST_USER_IDS.FIRST,
          userRepo: mockUserRepo,
          s3Service: mockS3Service
        })
      ).rejects.toThrow('User not found');

      expect(mockUserRepo.getById).toHaveBeenCalledWith(TEST_USER_IDS.FIRST);
    });
  });
});
