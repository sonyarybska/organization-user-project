import { getOrganizationRepo } from 'src/repos/organization.repo';
import { getUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { getUserRepo } from 'src/repos/user.repo';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { setupTestDatabase, teardownTestDatabase } from 'src/tests/utils/test-db-setup';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('UserOrganizationRepo', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('should create user-organization relation', async () => {
    const userRepo = getUserRepo(queryRunner.manager);
    const orgRepo = getOrganizationRepo(queryRunner.manager);
    const userOrgRepo = getUserOrganizationRepo(queryRunner.manager);

    const { id: userId } = await userRepo.create({
      cognitoUserId: 'cognito-123',
      email: 'user@test.com'
    });

    const { id: organizationId } = await orgRepo.create({ name: 'Test Org' });

    await userOrgRepo.create({
      userId,
      organizationId,
      role: UserRoleEnum.ADMIN
    });

    const result = await queryRunner.manager
      .getRepository(UserOrganizationEntity)
      .findOneBy({ userId, organizationId });

    expect(result?.userId).toBe(userId);
    expect(result?.organizationId).toBe(organizationId);
  });

  it('should throw error on invalid data', async () => {
    const userOrgRepo = getUserOrganizationRepo(queryRunner.manager);

    await expect(
      userOrgRepo.create({ userId: undefined, organizationId: undefined, role: undefined })
    ).rejects.toThrow('Failed to assign user to organization');
  });
});