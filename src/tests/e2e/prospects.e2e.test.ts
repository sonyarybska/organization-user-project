import { FastifyInstance } from 'fastify';
import {
  clearDatabase,
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { DataSource } from 'typeorm';
import { buildTestApp } from './utils/test-app';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { ProspectEntity } from 'src/services/typeorm/entities/ProspectEntity';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { CompanyEntity } from 'src/services/typeorm/entities/CompanyEntity';

describe('Prospects e2e', () => {
  let dataSource: DataSource;
  let app: FastifyInstance;
  let user: UserEntity;
  let organization: OrganizationEntity;
  let company: CompanyEntity;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
    app = await buildTestApp(dataSource);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    user = await createTestUserInDb(dataSource);
    mockCognitoService.getCognitoUserInfoByAccessToken.mockResolvedValue({
      subId: user.cognitoUserId
    });

    organization = await dataSource
      .getRepository(OrganizationEntity)
      .save({ name: 'Test Organization' });

    await dataSource.getRepository(UserOrganizationEntity).save({
      organizationId: organization.id,
      userId: user.id,
      role: UserRoleEnum.ADMIN
    });

    company = await dataSource.getRepository(CompanyEntity).save({
      domain: 'example.com',
      source: SourceTypeEnum.MANUAL,
      organizationId: organization.id,
      name: 'Example Inc.'
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('POST /api/organizations/prospects', () => {
    it('should create a prospect', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/organizations/prospects',
        headers: createAuthHeaders(organization.id),
        payload: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          domain: 'example.com',
          linkedinUrl: 'https://www.linkedin.com/in/johndoe/',
          title: 'Software Engineer',
          companyId: company.id
        }
      });

      expect(res.statusCode).toBe(200);
      const result = res.json();

      expect(result.id).toBeDefined();

      const prospect = await dataSource
        .getRepository(ProspectEntity)
        .findOne({ where: { id: result.id } });

      expect(prospect?.firstName).toBe('John');
      expect(prospect?.lastName).toBe('Doe');
      expect(prospect?.email).toBe('john.doe@example.com');
      expect(prospect?.linkedinUrl).toBe('linkedin.com/in/johndoe');
      expect(prospect?.source).toBe(SourceTypeEnum.MANUAL);
    });
  });

  describe('GET /api/organizations/prospects', () => {
    it('should get all prospects for organization', async () => {
      await dataSource.getRepository(ProspectEntity).save([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          userId: user.id,
          organizationId: organization.id,
          source: SourceTypeEnum.MANUAL,
          companyId: company.id
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          userId: user.id,
          organizationId: organization.id,
          source: SourceTypeEnum.MANUAL,
          companyId: company.id
        }
      ]);

      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations/prospects',
        headers: createAuthHeaders(organization.id)
      });

      expect(res.statusCode).toBe(200);
      const result = res.json();

      expect(result.count).toBe(2);
      expect(result.prospects).toHaveLength(2);
    });
  });
});
