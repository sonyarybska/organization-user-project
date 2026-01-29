import { loginUser } from 'src/controllers/auth/login-user';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate login to cognitoService', async () => {
    mockCognitoService.login.mockResolvedValueOnce({
      accessToken: TEST_TOKENS.ACCESS,
      refreshToken: TEST_TOKENS.REFRESH
    });

    const result = await loginUser({
      userRepo: mockUserRepo,
      email: 'test@test.com',
      password: 'pass',
      cognitoService: mockCognitoService
    });

    expect(mockCognitoService.login).toHaveBeenCalledWith('test@test.com', 'pass');
    expect(result).toEqual({ accessToken: TEST_TOKENS.ACCESS, refreshToken: TEST_TOKENS.REFRESH });
  });

  it('should throw on cognito error', async () => {
    mockCognitoService.login.mockRejectedValueOnce(new Error('Cognito error'));

    await expect(
      loginUser({
        userRepo: mockUserRepo,
        email: 'test@test.com',
        password: 'pass',
        cognitoService: mockCognitoService
      })
    ).rejects.toThrow('Cognito error');
  });
});
