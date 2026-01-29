import {
  clearDatabase,
  setupTestDatabase,
  teardownTestDatabase
} from 'src/tests/utils/test-db-setup';
import { DataSource } from 'typeorm';
import { buildTestApp } from './utils/test-app';
import { FastifyInstance } from 'fastify';

import {
  createTestUserInDb,
  createAuthHeaders
} from 'src/tests/e2e/utils/e2e-helpers';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('Attachments e2e', () => {
  let dataSource: DataSource;
  let app: FastifyInstance;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
    app = await buildTestApp(dataSource);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const user =await createTestUserInDb(dataSource);
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

  describe('POST /api/attachments', () => {
    it('should upload an attachment', async () => {
      const form = new FormData();

      form.append(
        'file',
        new Blob([Buffer.from('HELLO WORLD')], { type: 'text/plain' }),
        'hello.txt'
      );

      const res = await app.inject({
        method: 'POST',
        url: '/api/attachments',
        headers: createAuthHeaders(),
        payload: form
      });

      expect(res.statusCode).toBe(200);

      const body = res.json();
      
      expect(body).toMatchObject({
        id: expect.any(String)
      });
    });
  });
});
