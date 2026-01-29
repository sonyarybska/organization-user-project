import { getProspectRepo } from 'src/repos/prospect.repo';
import { getOrganizationRepo } from 'src/repos/organization.repo';
import { getUserRepo } from 'src/repos/user.repo';
import { ProspectEntity } from 'src/services/typeorm/entities/ProspectEntity';
import {
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('ProspectRepo', () => {
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

  describe('create', () => {
    it('should create prospect', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });

      const result = await prospectRepo.create({
        organizationId: org.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        title: 'Software Engineer',
        source: SourceTypeEnum.MANUAL
      });

      expect(result.id).toBeDefined();
      expect(result.organizationId).toBe(org.id);
      expect(result.userId).toBe(user.id);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.title).toBe('Software Engineer');

      const fromDb = await queryRunner.manager
        .getRepository(ProspectEntity)
        .findOneBy({ id: result.id });

      expect(fromDb?.firstName).toBe('John');
      expect(fromDb?.email).toBe('john.doe@example.com');
    });

    it('should throw error on invalid create', async () => {
      const prospectRepo = getProspectRepo(queryRunner.manager);

      await expect(prospectRepo.create({})).rejects.toThrow('Failed to create prospect');
    });
  });

  describe('getByOrganizationId', () => {
    it('should get prospects by organization id', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });

      await prospectRepo.create({
        organizationId: org.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: SourceTypeEnum.MANUAL
      });

      await prospectRepo.create({
        organizationId: org.id,
        userId: user.id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        source: SourceTypeEnum.MANUAL
      });

      const result = await prospectRepo.getByOrganizationId(org.id);

      expect(result.count).toBe(2);
      expect(result.prospects).toHaveLength(2);
      expect(result.prospects.map(p => p.firstName)).toEqual(
        expect.arrayContaining(['John', 'Jane'])
      );
    });

    it('should return empty array for organization with no prospects', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });

      const result = await prospectRepo.getByOrganizationId(org.id);

      expect(result.count).toBe(0);
      expect(result.prospects).toHaveLength(0);
    });

    it('should throw error on getByOrganizationId with invalid organizationId', async () => {
      const prospectRepo = getProspectRepo(queryRunner.manager);

      await expect(
        prospectRepo.getByOrganizationId('invalid')
      ).rejects.toThrow('Prospects for organization id invalid not found');
    });
  });

  describe('getByIdAndOrganizationId', () => {
    it('should get prospect by id and organization id', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });
      const prospect = await prospectRepo.create({
        organizationId: org.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: SourceTypeEnum.MANUAL
      });

      const result = await prospectRepo.getByIdAndOrganizationId(
        prospect.id,
        org.id
      );

      expect(result.id).toBe(prospect.id);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.organizationId).toBe(org.id);
    });

    it('should throw error when prospect not found', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });

      await expect(
        prospectRepo.getByIdAndOrganizationId('invalid-id', org.id)
      ).rejects.toThrow('Prospect with id invalid-id not found');
    });

    it('should throw error when organization id does not match', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org1 = await orgRepo.create({ name: 'Test Org 1' });
      const org2 = await orgRepo.create({ name: 'Test Org 2' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });

      const prospect = await prospectRepo.create({
        organizationId: org1.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: SourceTypeEnum.MANUAL
      });

      await expect(
        prospectRepo.getByIdAndOrganizationId(prospect.id, org2.id)
      ).rejects.toThrow(`Prospect with id ${prospect.id} not found`);
    });
  });

  describe('deleteByIdAndOrganizationId', () => {
    it('should delete prospect by id and organization id', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org = await orgRepo.create({ name: 'Test Org' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });
      const prospect = await prospectRepo.create({
        organizationId: org.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: SourceTypeEnum.MANUAL
      });

      await prospectRepo.deleteByIdAndOrganizationId(prospect.id, org.id);

      const fromDb = await queryRunner.manager
        .getRepository(ProspectEntity)
        .findOneBy({ id: prospect.id });

      expect(fromDb).toBeNull();
    });

    it('should not delete prospect from different organization', async () => {
      const orgRepo = getOrganizationRepo(queryRunner.manager);
      const userRepo = getUserRepo(queryRunner.manager);
      const prospectRepo = getProspectRepo(queryRunner.manager);

      const org1 = await orgRepo.create({ name: 'Test Org 1' });
      const org2 = await orgRepo.create({ name: 'Test Org 2' });
      const user = await userRepo.create({
        name: 'Test User',
        email: 'user@test.com',
        cognitoUserId: 'cognito-123'
      });

      const prospect = await prospectRepo.create({
        organizationId: org1.id,
        userId: user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: SourceTypeEnum.MANUAL
      });

      await prospectRepo.deleteByIdAndOrganizationId(prospect.id, org2.id);

      const fromDb = await queryRunner.manager
        .getRepository(ProspectEntity)
        .findOneBy({ id: prospect.id });

      expect(fromDb).not.toBeNull();
      expect(fromDb?.organizationId).toBe(org1.id);
    });
  });
});
