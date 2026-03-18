import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { TEST_TOKENS, TEST_ORG_IDS } from 'src/tests/fixtures/test-constants';
import { createTestUser } from 'src/tests/fixtures/test-factories';
import { DBError } from 'src/types/errors/DBError';
import { getUsersByOrganizationId } from 'src/controllers/user/get-users-by-organization-id';

describe('getUsersByOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful retrieval', () => {
    it('returns organization users with signed avatar urls', async () => {
      const testUser1 = createTestUser();
      const testUser2 = createTestUser();

      mockUserRepo.getUsersByOrganizationId.mockResolvedValue([testUser1, testUser2]);
      mockS3Service.getSignedUrl.mockResolvedValue(TEST_TOKENS.SIGNED_URL);

      const result = await getUsersByOrganizationId({
        organizationId: TEST_ORG_IDS.FIRST,
        userRepo: mockUserRepo,
        s3Service: mockS3Service
      });

      expect(mockUserRepo.getUsersByOrganizationId).toHaveBeenCalledWith(TEST_ORG_IDS.FIRST);
      expect(mockS3Service.getSignedUrl).toHaveBeenCalledTimes(2);
      expect(mockS3Service.getSignedUrl).toHaveBeenNthCalledWith(
        1,
        testUser1.avatar!.key,
        Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC),
        process.env.AWS_S3_BUCKET_NAME
      );
      expect(mockS3Service.getSignedUrl).toHaveBeenNthCalledWith(
        2,
        testUser2.avatar!.key,
        Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC),
        process.env.AWS_S3_BUCKET_NAME
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: testUser1.id,
        avatar: {
          id: testUser1.avatar!.id,
          url: TEST_TOKENS.SIGNED_URL
        }
      });
      expect(result[1]).toMatchObject({
        id: testUser2.id,
        avatar: {
          id: testUser2.avatar!.id,
          url: TEST_TOKENS.SIGNED_URL
        }
      });
    });
  });

  describe('on retrieval failure', () => {
    it('propagates database error', async () => {
      const dbError = new DBError('Organization not found');
      mockUserRepo.getUsersByOrganizationId.mockRejectedValue(dbError);

      await expect(
        getUsersByOrganizationId({
          organizationId: TEST_ORG_IDS.FIRST,
          userRepo: mockUserRepo,
          s3Service: mockS3Service
        })
      ).rejects.toThrow('Organization not found');

      expect(mockUserRepo.getUsersByOrganizationId).toHaveBeenCalledWith(TEST_ORG_IDS.FIRST);
    });
  });
});
