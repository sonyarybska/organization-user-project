
import { DataSource } from 'typeorm';
import { UserEntity } from 'src/services/typeorm/entities/UserEntity';
import { TEST_IDS, TEST_TOKENS } from 'src/tests/fixtures/test-constants';

export async function createTestUserInDb(
  dataSource: DataSource,
  overrides: Partial<UserEntity> = {}
): Promise<UserEntity> {
  return await dataSource.getRepository(UserEntity).save({
    cognitoUserId: TEST_IDS.COGNITO_1,
    email: 'user1@test.com',
    name: 'Test User',
    ...overrides
  });
}

export function createAuthHeaders(
  organizationId?: string,
  accessToken: string = TEST_TOKENS.ACCESS
) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${accessToken}`
  };

  if (organizationId) {
    headers['organization-id'] = organizationId;
  }

  return headers;
}
