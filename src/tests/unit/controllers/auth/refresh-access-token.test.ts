import { refreshAccessToken } from 'src/controllers/auth/refresh-access-token';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('refreshAccessToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful refresh', () => {
    it('returns new access token', async () => {
      mockCognitoService.refreshAccessToken.mockResolvedValue({
        accessToken: TEST_TOKENS.ACCESS
      });

      const result = await refreshAccessToken({
        refreshToken: TEST_TOKENS.REFRESH,
        cognitoService: mockCognitoService
      });

      expect(mockCognitoService.refreshAccessToken).toHaveBeenCalledWith(TEST_TOKENS.REFRESH);
      expect(result).toEqual({ accessToken: TEST_TOKENS.ACCESS });
    });
  });

  describe('on refresh failure', () => {
    it('propagates cognito error', async () => {
      const refreshError = new Error('Invalid refresh token');
      mockCognitoService.refreshAccessToken.mockRejectedValue(refreshError);

      await expect(
        refreshAccessToken({
          refreshToken: TEST_TOKENS.REFRESH,
          cognitoService: mockCognitoService
        })
      ).rejects.toThrow('Invalid refresh token');
    });
  });
});
