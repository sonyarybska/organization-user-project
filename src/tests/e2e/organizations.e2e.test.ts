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
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { TEST_IDS } from 'src/tests/fixtures/test-constants';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { OrganizationInviteEntity } from 'src/services/typeorm/entities/OrganizationInviteEntity';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockHmacService } from 'src/tests/mocks/services/hmac.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';

describe('Organizations e2e', () => {
  let dataSource: DataSource;
  let app: FastifyInstance;
  let user: UserEntity;
  let organization: OrganizationEntity;

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
    mockHmacService.getSignature.mockReturnValue('test-token-signature');
    mockSendGridService.sendInviteEmail.mockResolvedValue();
    
    organization = await dataSource
      .getRepository(OrganizationEntity)
      .save({ name: 'Test Org' });

    await dataSource
      .getRepository(UserOrganizationEntity)
      .save({
        organizationId: organization.id,
        userId: user.id,
        role: UserRoleEnum.ADMIN
      });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('POST /api/organizations', () => {
    it('should create an organization', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/organizations',
        headers: createAuthHeaders(),
        payload: { name: 'Test Org 2' }
      });

      expect(res.statusCode).toBe(200);

      const org = await dataSource
        .getRepository(OrganizationEntity)
        .findOne({ where: { name: 'Test Org 2' } });

      expect(org?.name).toBe('Test Org 2');
    });
  });

  describe('GET /api/organizations/users', () => {
    it('should retrieve users by organization ID', async () => {
      const user2 = await createTestUserInDb(dataSource, {
        cognitoUserId: TEST_IDS.COGNITO_2,
        email: 'user2@test.com',
        name: 'User 2'
      });

      await dataSource
        .getRepository(UserOrganizationEntity)
        .save({
          organizationId: organization.id,
          userId: user2.id,
          role: UserRoleEnum.USER
        });

      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations/users',
        headers: createAuthHeaders(organization.id)
      });

      expect(res.statusCode).toBe(200);

      const users = res.json();
      expect(users).toHaveLength(2);
      expect(users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: user.email }),
          expect.objectContaining({ email: 'user2@test.com' })
        ])
      );
    });
  });

  describe('Organization invites', () => {
    it('should return invites by organization ID', async () => {
      await dataSource.getRepository(OrganizationInviteEntity).save({
        organizationId: organization.id,
        email: 'invite@test.com',
        expiresAt: new Date('2026-12-31'),
        token: 'test-token',
        status: InviteStatus.PENDING
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/organizations/invites',
        headers: createAuthHeaders(organization.id)
      });

      expect(res.statusCode).toBe(200);

      const invites = res.json();
      expect(invites).toHaveLength(1);
      expect(invites[0]).toMatchObject({
        email: 'invite@test.com',
        status: InviteStatus.PENDING
      });
    });

    it('should create an invite', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/organizations/invites',
        headers: createAuthHeaders(organization.id),
        payload: { email: 'newinvite@test.com' }
      });

      expect(res.statusCode).toBe(200);

      const invite = await dataSource
        .getRepository(OrganizationInviteEntity)
        .findOne({ where: { email: 'newinvite@test.com' } });

      expect(invite).toMatchObject({
        organizationId: organization.id,
        email: 'newinvite@test.com',
        status: InviteStatus.PENDING
      });
      expect(invite?.token).toEqual(expect.any(String));
      expect(invite?.expiresAt).toBeInstanceOf(Date);
    });

    it('should decline an invite', async () => {
      const invite = await dataSource
        .getRepository(OrganizationInviteEntity)
        .save({
          organizationId: organization.id,
          email: 'decline@test.com',
          expiresAt: new Date('2026-12-31'),
          token: 'test-token',
          status: InviteStatus.PENDING
        });

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/organizations/invites/${invite.id}/decline`,
        headers: createAuthHeaders(organization.id)
      });

      expect(res.statusCode).toBe(200);

      const updated = await dataSource
        .getRepository(OrganizationInviteEntity)
        .findOne({ where: { id: invite.id } });

      expect(updated?.status).toBe(InviteStatus.DECLINED_BY_ADMIN);
    });
  });
});
