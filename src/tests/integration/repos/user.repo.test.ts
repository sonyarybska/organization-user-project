import { getUserRepo } from 'src/repos/user.repo';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { setupTestDatabase, teardownTestDatabase } from 'src/tests/utils/test-db-setup';
import { DataSource, QueryRunner } from 'typeorm';

describe('User repo', () => {
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

  it('should create user', async () => {
    const repo = getUserRepo(queryRunner.manager);

    const result = await repo.create({
      cognitoUserId: 'cognito-123',
      email: 'user@test.com',
      name: 'Test User'
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe('user@test.com');

    const fromDb = await queryRunner.manager
      .getRepository(UserEntity)
      .findOneBy({ id: result.id });

    expect(fromDb?.email).toBe('user@test.com');
  });

  it('should throw error on invalid data', async () => {
    const repo = getUserRepo(queryRunner.manager);

    await expect(
      repo.create({ cognitoUserId: undefined, email: 'invalid' } as any)
    ).rejects.toThrow('Failed to create user');
  });
});