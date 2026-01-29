import { getCompanyRepo } from 'src/repos/company.repo';
import { CompanyEntity } from 'src/services/typeorm/entities/CompanyEntity';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import {
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { DataSource, QueryRunner } from 'typeorm';

describe('CompanyRepo', () => {
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

  describe('upsert', () => {
    it('should update only linkedinUrl, name, address on conflict - NOT id and source', async () => {
      const repo = getCompanyRepo(queryRunner.manager);

      const organization = await queryRunner.manager.save(OrganizationEntity, {
        name: 'Test Organization'
      });

      const initial = await queryRunner.manager.save(CompanyEntity, {
        domain: 'example.com',
        source: SourceTypeEnum.MANUAL,
        organizationId: organization.id,
        linkedinUrl: 'linkedin.com/company/initial',
        name: 'Initial Name',
        address: 'Initial Address'
      });

      const result = await repo.upsert({
        domain: 'example.com',
        organizationId: organization.id,
        source: SourceTypeEnum.CSV_IMPORT,
        linkedinUrl: 'linkedin.com/company/new',
        name: 'New Name',
        address: 'New Address'
      });

      expect(result.id).toBe(initial.id);
      expect(result.domain).toBe('example.com');
      expect(result.organizationId).toBe(organization.id);
      expect(result.source).toBe(SourceTypeEnum.MANUAL);
      expect(result.linkedinUrl).toBe('linkedin.com/company/new');
      expect(result.name).toBe('New Name');
      expect(result.address).toBe('New Address');
    });

    it('should create new company when domain does not exist', async () => {
      const repo = getCompanyRepo(queryRunner.manager);

      const organization = await queryRunner.manager.save(OrganizationEntity, {
        name: 'Test Organization'
      });

      const result = await repo.upsert({
        domain: 'newcompany.com',
        organizationId: organization.id,
        source: SourceTypeEnum.CSV_IMPORT,
        linkedinUrl: 'linkedin.com/company/new',
        name: 'New Company',
        address: '123 Main St'
      });

      expect(result.id).toBeDefined();
      expect(result.domain).toBe('newcompany.com');
      expect(result.source).toBe(SourceTypeEnum.CSV_IMPORT);
      expect(result.linkedinUrl).toBe('linkedin.com/company/new');
      expect(result.name).toBe('New Company');
      expect(result.address).toBe('123 Main St');
    });
   
  });
});
