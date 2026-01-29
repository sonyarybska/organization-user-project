import { mockS3Service } from 'src/tests/mocks/services/s3.service.mock';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { v4 as uuid } from 'uuid';
import { createTestUser } from 'src/tests/fixtures/test-factories';
import { DBError } from 'src/types/errors/DBError';
import { getUsersByOrganizationId } from 'src/controllers/user/get-users-by-organization-id';

describe('getUsersByOrganizationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return organization users with signed avatar urls', async () => {
    const organizationId = uuid();
    const testUser1 = createTestUser();
    const testUser2 = createTestUser();

    mockUserRepo.getUsersByOrganizationId.mockResolvedValueOnce([
      testUser1,
      testUser2
    ]);
    mockS3Service.getSignedUrl.mockResolvedValue('https://signed-url.test.mock');

    const result = await getUsersByOrganizationId({
      organizationId,
      userRepo: mockUserRepo,
      s3Service: mockS3Service
    });

    expect(mockUserRepo.getUsersByOrganizationId).toHaveBeenCalledWith(
      organizationId
    );
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
        url: 'https://signed-url.test.mock'
      }
    });

    expect(result[1]).toMatchObject({
      id: testUser2.id,
      avatar: {
        id: testUser2.avatar!.id,
        url: 'https://signed-url.test.mock'
      }
    });
  });

  it('should throw if db error', async () => {
    const organizationId = uuid();

    mockUserRepo.getUsersByOrganizationId.mockRejectedValueOnce(
      new DBError('DB error')
    );

    await expect(
      getUsersByOrganizationId({
        organizationId,
        userRepo: mockUserRepo,
        s3Service: mockS3Service
      })
    ).rejects.toThrow('DB error');

    expect(mockUserRepo.getUsersByOrganizationId).toHaveBeenCalledWith(
      organizationId
    );
  });
});
