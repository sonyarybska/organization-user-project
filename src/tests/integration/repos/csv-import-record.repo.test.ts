import { getCsvImportRecordRepo } from 'src/repos/csv-import-record.repo';
import { CsvImportRecordEntity } from 'src/services/typeorm/entities/CsvImportRecordEntity';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { setupTestDatabase, teardownTestDatabase } from 'src/tests/utils/test-db-setup';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('CsvImportRecordRepo', () => {
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

  async function createUserAndOrg() {
    const unique = `${Date.now()}-${Math.random()}`;

    const org = await queryRunner.manager.getRepository(OrganizationEntity).save({
      name: `Test Org ${unique}`
    });

    const user = await queryRunner.manager.getRepository(UserEntity).save({
      cognitoUserId: `cognito-${unique}`,
      email: `test-${unique}@test.com`,
      name: 'Test User'
    });

    return { organizationId: org.id, userId: user.id };
  }

  it('should create csv import record', async () => {
    const repo = getCsvImportRecordRepo(queryRunner.manager);
    const { organizationId, userId } = await createUserAndOrg();

    const result = await repo.create({
      key: 'imports/import.csv',
      organizationId,
      userId,
      status: CsvImportStatusEnum.NEW,
      totalRows: 100
    });

    expect(result.id).toBeDefined();
    expect(result.key).toBe('imports/import.csv');
    expect(result.status).toBe(CsvImportStatusEnum.NEW);

    const fromDb = await queryRunner.manager
      .getRepository(CsvImportRecordEntity)
      .findOneBy({ id: result.id });

    expect(fromDb?.totalRows).toBe(100);
    expect(fromDb?.organizationId).toBe(organizationId);
  });

  it('should get csv import record by id', async () => {
    const repo = getCsvImportRecordRepo(queryRunner.manager);
    const { organizationId, userId } = await createUserAndOrg();

    const created = await repo.create({
      key: 'imports/file.csv',
      organizationId,
      userId,
      status: CsvImportStatusEnum.NEW
    });

    const found = await repo.getById(created.id);
    expect(found.id).toBe(created.id);
    expect(found.key).toBe('imports/file.csv');
  });

  it('should update csv import record', async () => {
    const repo = getCsvImportRecordRepo(queryRunner.manager);
    const { organizationId, userId } = await createUserAndOrg();

        const created = await repo.create({
            key: 'imports/file.csv',
            organizationId,
            userId,
            status: CsvImportStatusEnum.NEW
        });

        const updated = await repo.update(created.id, {
            status: CsvImportStatusEnum.BUSY,
            totalRows: 5
        });

        expect(updated.id).toBe(created.id);
        expect(updated.status).toBe(CsvImportStatusEnum.BUSY);
        expect(updated.totalRows).toBe(5);
    });

    it('should increment processedRows', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        const { organizationId, userId } = await createUserAndOrg();

        const created = await repo.create({
            key: 'imports/file.csv',
            organizationId,
            userId,
            status: CsvImportStatusEnum.BUSY
        });

        await repo.incrementProcessedRows(created.id);
        await repo.incrementProcessedRows(created.id);

        const fromDb = await queryRunner.manager
            .getRepository(CsvImportRecordEntity)
            .findOneByOrFail({ id: created.id });

        expect(fromDb.processedRows).toBe(2);
    });

    it('should handle import error (set status=ERROR and increment failedRows)', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        const { organizationId, userId } = await createUserAndOrg();

        const created = await repo.create({
            key: 'imports/file.csv',
            organizationId,
            userId,
            status: CsvImportStatusEnum.BUSY
        });

        await repo.handleImportError(created.id, 'Bad row');
        await repo.handleImportError(created.id, 'Bad row');

        const fromDb = await queryRunner.manager
            .getRepository(CsvImportRecordEntity)
            .findOneByOrFail({ id: created.id });

        expect(fromDb.status).toBe(CsvImportStatusEnum.ERROR);
        expect(fromDb.failedRows).toBe(2);
        expect(fromDb.lastError).toBe('Bad row');
    });

    it('should return true only when processed+failed >= totalRows', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        const { organizationId, userId } = await createUserAndOrg();

        const recordDone = await repo.create({
            key: 'imports/done.csv',
            organizationId,
            userId,
            status: CsvImportStatusEnum.BUSY,
            totalRows: 2
        });

        await repo.update(recordDone.id, { processedRows: 1, failedRows: 1 });
        await expect(repo.checkIfDone(recordDone.id)).resolves.toBe(true);

        const recordNotDone = await repo.create({
            key: 'imports/not-done.csv',
            organizationId,
            userId,
            status: CsvImportStatusEnum.BUSY,
            totalRows: 3
        });

        await repo.update(recordNotDone.id, { processedRows: 1, failedRows: 1 });
        await expect(repo.checkIfDone(recordNotDone.id)).resolves.toBe(false);
    });

    it('should throw DBError on invalid create', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        await expect(repo.create({} as any)).rejects.toThrow(
            'Failed to create csv import record'
        );
    });

    it('should throw DBError on missing getById', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        const missingId = '00000000-0000-0000-0000-000000000000';
        await expect(repo.getById(missingId)).rejects.toThrow(
            `Failed to get csv import record with id ${missingId}`
        );
    });

    it('should throw DBError on update of missing record', async () => {
        const repo = getCsvImportRecordRepo(queryRunner.manager);
        const missingId = '00000000-0000-0000-0000-000000000000';
        await expect(
            repo.update(missingId, { status: CsvImportStatusEnum.DONE })
        ).rejects.toThrow(`Failed to update csv import record with id ${missingId}`);
    });
});