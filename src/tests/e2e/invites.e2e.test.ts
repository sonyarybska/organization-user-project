import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { OrganizationInviteEntity } from 'src/services/typeorm/entities/OrganizationInviteEntity';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearDatabase
} from '../utils/test-db-setup';
import { buildTestApp } from './utils/test-app';
import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';

describe('Invites e2e', () => {
  let dataSource: DataSource;
  let app: FastifyInstance;
  let user: UserEntity;

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
    mockHmacService.validateToken.mockReturnValue(true);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('should accept an invite', async () => {
    const org = await dataSource
      .getRepository(OrganizationEntity)
      .save({ name: 'Test Org' });

    const token = 'test-invite-token';

    await dataSource.getRepository(OrganizationInviteEntity).save({
      email: user.email,
      organizationId: org.id,
      expiresAt: new Date('2026-12-31'),
      token,
      status: InviteStatus.PENDING
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/invites/join',
      headers: createAuthHeaders(),
      payload: { token }
    });

    expect(res.statusCode).toBe(200);

    const membership = await dataSource
      .getRepository(UserOrganizationEntity)
      .findOne({
        where: {
          userId: user.id,
          organizationId: org.id
        }
      });

    expect(membership).toBeTruthy();

    const invite = await dataSource
      .getRepository(OrganizationInviteEntity)
      .findOne({ where: { token } });

    expect(invite?.status).toBe(InviteStatus.ACCEPTED);
  });
});
