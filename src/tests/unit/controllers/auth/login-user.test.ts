import { loginUser } from 'src/controllers/auth/login-user';
import { TEST_TOKENS, TEST_EMAILS, TEST_PASSWORDS } from 'src/tests/fixtures/test-constants';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful authentication', () => {
    it('returns access and refresh tokens', async () => {
      mockCognitoService.login.mockResolvedValue({
        accessToken: TEST_TOKENS.ACCESS,
        refreshToken: TEST_TOKENS.REFRESH
      });

      const result = await loginUser({
        userRepo: mockUserRepo,
        email: TEST_EMAILS.VALID_USER,
        password: TEST_PASSWORDS.VALID,
        cognitoService: mockCognitoService
      });

      expect(mockCognitoService.login).toHaveBeenCalledWith(
        TEST_EMAILS.VALID_USER,
        TEST_PASSWORDS.VALID
      );
      expect(result).toEqual({
        accessToken: TEST_TOKENS.ACCESS,
        refreshToken: TEST_TOKENS.REFRESH
      });
    });
  });

  describe('on authentication failure', () => {
    it('propagates cognito error', async () => {
      const authError = new Error('Invalid credentials');
      mockCognitoService.login.mockRejectedValue(authError);

      await expect(
        loginUser({
          userRepo: mockUserRepo,
          email: TEST_EMAILS.VALID_USER,
          password: TEST_PASSWORDS.WEAK,
          cognitoService: mockCognitoService
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
