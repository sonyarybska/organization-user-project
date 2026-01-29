import { DataSource } from 'typeorm';
import { FastifyInstance } from 'fastify';
import { buildTestApp } from 'src/tests/e2e/utils/test-app';
import {
  clearDatabase,
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { TEST_IDS, TEST_TOKENS } from 'src/tests/fixtures/test-constants';

describe('Auth e2e', () => {
  let dataSource: DataSource;
  let app: FastifyInstance;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
    app = await buildTestApp(dataSource);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('should create org, user, and membership', async () => {
    mockCognitoService.createCognitoUser.mockResolvedValueOnce(
      TEST_IDS.COGNITO_1
    );

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'New User',
        organizationName: 'Acme',
        email: 'new@test.com',
        password: 'pass',
        companyName: 'Company',
        companyUrl: 'https://company.example',
        birthday: '2000-01-01'
      }
    });

    expect(res.statusCode).toBe(200);

    const org = await dataSource
      .getRepository(OrganizationEntity)
      .findOne({ where: { name: 'Acme' } });

    expect(org?.name).toBe('Acme');

    const user = await dataSource
      .getRepository(UserEntity)
      .findOne({ where: { email: 'new@test.com' } });

    expect(user?.cognitoUserId).toBe(TEST_IDS.COGNITO_1);

    const membership = await dataSource
      .getRepository(UserOrganizationEntity)
      .findOne({
        where: {
          userId: user!.id,
          organizationId: org!.id
        }
      });

    expect(membership?.role).toBe(UserRoleEnum.ADMIN);
  });

  it('should return tokens', async () => {
    await createTestUserInDb(dataSource);

    mockCognitoService.login.mockResolvedValueOnce({
      accessToken:TEST_TOKENS.ACCESS,
      refreshToken: TEST_TOKENS.REFRESH
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'user1@test.com',
        password: 'pass'
      }
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      accessToken: TEST_TOKENS.ACCESS,
      refreshToken: TEST_TOKENS.REFRESH
    });
  });

  it('should return new access token', async () => {
    await createTestUserInDb(dataSource, {
      cognitoUserId: TEST_IDS.COGNITO_1
    });

    const accessToken = 'new-access-token';
    const refreshToken = 'test-refresh-token';

    mockCognitoService.refreshAccessToken.mockResolvedValueOnce({
      accessToken
    });
    mockCognitoService.getCognitoUserInfoByAccessToken.mockResolvedValue({
      subId: TEST_IDS.COGNITO_1
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      headers: createAuthHeaders(),
      payload: { refreshToken }
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ accessToken });
  });
});
