import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearDatabase
} from '../utils/test-db-setup';
import { buildTestApp } from './utils/test-app';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { OrganizationEntity } from 'src/services/typeorm/entities/OrganizationEntity';
import { OrganizationInviteEntity } from 'src/services/typeorm/entities/OrganizationInviteEntity';
import { UserOrganizationEntity } from 'src/services/typeorm/entities/UserOrganizationEntity';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('Me e2e', () => {
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
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  describe('GET /api/me', () => {
    it('should retrieve current user info', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/me',
        headers: createAuthHeaders()
      });

      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name
      });
    });
  });

  describe('PATCH /api/me', () => {
    it('should update current user info', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/me',
        headers: createAuthHeaders(),
        payload: {
          name: 'Updated Name',
          companyName: 'Updated Company',
          companyUrl: 'https://updated.com',
          birthday: '1990-05-15'
        }
      });

      expect(res.statusCode).toBe(200);

      const updated = await dataSource
        .getRepository(UserEntity)
        .findOneBy({ id: user.id });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.companyName).toBe('Updated Company');
      expect(updated?.companyUrl).toBe('https://updated.com');
      expect(updated?.birthday?.toISOString().split('T')[0]).toBe('1990-05-15');
    });
  });

  describe('GET /api/me/invites', () => {
    it('should retrieve current user invites', async () => {
      const org = await dataSource
        .getRepository(OrganizationEntity)
        .save({ name: 'Test Org' });

      await dataSource
        .getRepository(UserOrganizationEntity)
        .save({
          organizationId: org.id,
          userId: user.id,
          role: UserRoleEnum.ADMIN
        });

      await dataSource
        .getRepository(OrganizationInviteEntity)
        .save({
          email: user.email,
          organizationId: org.id,
          expiresAt: new Date('2026-12-31'),
          token: 'test-invite-token',
          status: InviteStatus.PENDING
        });

      const res = await app.inject({
        method: 'GET',
        url: '/api/me/invites',
        headers: createAuthHeaders(org.id)
      });

      expect(res.statusCode).toBe(200);

      const invites = res.json();
      expect(invites).toHaveLength(1);
      expect(invites[0]).toMatchObject({
        email: user.email,
        status: InviteStatus.PENDING
      });
    });
  });

  describe('GET /api/me/organizations', () => {
    it('should retrieve current user organizations', async () => {
      const org1 = await dataSource
        .getRepository(OrganizationEntity)
        .save({ name: 'Org 1' });

      const org2 = await dataSource
        .getRepository(OrganizationEntity)
        .save({ name: 'Org 2' });

      await dataSource
        .getRepository(UserOrganizationEntity)
        .save([
          {
            organizationId: org1.id,
            userId: user.id,
            role: UserRoleEnum.USER
          },
          {
            organizationId: org2.id,
            userId: user.id,
            role: UserRoleEnum.ADMIN
          }
        ]);

      const res = await app.inject({
        method: 'GET',
        url: '/api/me/organizations',
        headers: createAuthHeaders()
      });

      expect(res.statusCode).toBe(200);

      const orgs = res.json();
      expect(orgs).toHaveLength(2);
      expect(orgs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: org1.id }),
          expect.objectContaining({ id: org2.id })
        ])
      );
    });
  });
});
