import { getOrganizationRepo } from 'src/repos/organization.repo';
import { getUserOrganizationRepo } from 'src/repos/user-organization.repo';
import { getUserRepo } from 'src/repos/user.repo';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import {
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('OrganizationRepo', () => {
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

  it('should create organization', async () => {
    const repo = getOrganizationRepo(queryRunner.manager);

    const result = await repo.create({ name: 'Test Org' });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test Org');

    const fromDb = await queryRunner.manager
      .getRepository(OrganizationEntity)
      .findOneBy({ id: result.id });

    expect(fromDb?.name).toBe('Test Org');
  });

  it('should get by id and userId', async () => {
    const orgRepo = getOrganizationRepo(queryRunner.manager);
    const userOrgRepo = getUserOrganizationRepo(queryRunner.manager);
    const userRepo = getUserRepo(queryRunner.manager);

    const org = await orgRepo.create({ name: 'Test Org' });
    const { id: userId } = await userRepo.create({
      name: 'User 1',
      email: 'user1@test.com',
      cognitoUserId: 'cognito-1'
    });
    await userOrgRepo.create({
      organizationId: org.id,
      userId,
      role: UserRoleEnum.ADMIN
    });

    const result = await orgRepo.getByIdAndUserId(org.id, userId);

    expect(result?.id).toBe(org.id);
    expect(result?.name).toBe('Test Org');
  });

  it('should get organizations by userId', async () => {
    const orgRepo = getOrganizationRepo(queryRunner.manager);
    const userOrgRepo = getUserOrganizationRepo(queryRunner.manager);
    const userRepo = getUserRepo(queryRunner.manager);

    const org1 = await orgRepo.create({ name: 'Org 1' });
    const org2 = await orgRepo.create({ name: 'Org 2' });

    const { id: userId } = await userRepo.create({
      name: 'User 1',
      email: 'user1@test.com',
      cognitoUserId: 'cognito-1'
    });

    await userOrgRepo.create({
      organizationId: org1.id,
      userId,
      role: UserRoleEnum.USER
    });
    await userOrgRepo.create({
      organizationId: org2.id,
      userId,
      role: UserRoleEnum.USER
    });

    const orgs = await orgRepo.getByUserId(userId);

    expect(orgs).toHaveLength(2);
    expect(orgs.map(o => o.id)).toEqual(expect.arrayContaining([org1.id, org2.id]));
  });

  it('should throw error on invalid create', async () => {
    const repo = getOrganizationRepo(queryRunner.manager);

    await expect(repo.create({})).rejects.toThrow('Failed to create organization');
  });

  it('should throw error on getByIdAndUserId with invalid ids', async () => {
    const repo = getOrganizationRepo(queryRunner.manager);

    await expect(
      repo.getByIdAndUserId('invalid', 'invalid')
    ).rejects.toThrow('Organization with id invalid not found');
  });

  it('should throw error on getByUserId with invalid userId', async () => {
    const repo = getOrganizationRepo(queryRunner.manager);

    await expect(repo.getByUserId('invalid')).rejects.toThrow(
      'Organizations for user with id invalid not found'
    );
  });
});
