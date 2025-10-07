/* eslint-disable no-param-reassign */
import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';

export const authHook: preHandlerAsyncHookHandler = async function (request) {
  if (request.routeOptions.config.skipAuth) {
    return;
  }

  try {
    const token = request.headers.authorization;

    if (!token) {
      throw new Error('Authorization token is missing');
    }

    const bearerTokenMatch = token.match(/Bearer\s+([A-Za-z0-9-._~+\/]+=*)$/);

    if (!bearerTokenMatch) {
      throw new Error('Token in wrong format');
    }

    const { subId } = await this.cognitoService.getCognitoUserInfoByAccessToken(
      bearerTokenMatch[1]
    );

    const userProfile = await this.repos.userRepo.getUserByCognitoUserId(subId);

    request.userProfile = userProfile;
  } catch (error) {
    throw new HttpError(401, 'Authorization failed', error);
  }
};
