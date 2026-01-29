import { refreshAccessToken } from 'src/controllers/auth/refresh-access-token';
import { TEST_TOKENS } from 'src/tests/fixtures/test-constants';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';

describe('refreshAccessToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate refresh to cognitoService', async () => {
    mockCognitoService.refreshAccessToken.mockResolvedValueOnce({
      accessToken: TEST_TOKENS.ACCESS
    });

    const result = await refreshAccessToken({
      refreshToken: TEST_TOKENS.REFRESH,
      cognitoService: mockCognitoService
    });

    expect(mockCognitoService.refreshAccessToken).toHaveBeenCalledWith(TEST_TOKENS.REFRESH);
    expect(result).toEqual({ accessToken: TEST_TOKENS.ACCESS });
  });

  it('should throw on cognito error', async () => {
    mockCognitoService.refreshAccessToken.mockRejectedValueOnce(
      new Error('Cognito error')
    );

    await expect(
      refreshAccessToken({
        refreshToken: 'refresh-2',
        cognitoService: mockCognitoService
      })
    ).rejects.toThrow('Cognito error');
  });
});
