import { DataSource, QueryRunner } from 'typeorm';
import { getAttachmentRepo } from 'src/repos/attachment.repo';
import { AttachmentEntity } from 'src/services/typeorm/entities/AttachmentEntity';
import { setupTestDatabase, teardownTestDatabase } from 'src/tests/utils/test-db-setup';

describe('AttachmentRepo', () => {
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

  it('should create attachment', async () => {
    const repo = getAttachmentRepo(queryRunner.manager);

    const result = await repo.create({
      originalName: 'file.pdf',
      key: 'attachments/file.pdf',
      publicKey: 'public/attachments/file.pdf',
      userId: 'user-123'
    });

    expect(result.id).toBeDefined();
    expect(result.originalName).toBe('file.pdf');

    const fromDb = await queryRunner.manager
      .getRepository(AttachmentEntity)
      .findOneBy({ id: result.id });

    expect(fromDb?.key).toBe('attachments/file.pdf');
  });

  it('should throw error on invalid data', async () => {
    const repo = getAttachmentRepo(queryRunner.manager);

    await expect(
      repo.create({ originalName: undefined, key: undefined, publicKey: undefined, userId: undefined })
    ).rejects.toThrow('Failed to create attachment');
  });
});
