/* eslint-disable no-param-reassign */
import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';
import { JwtPayload } from 'src/types/JwtPayload';

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

    request.jwtVerify();

    const { id } = (await request.jwtDecode()) as JwtPayload;

    request.userProfile = await this.repos.userRepo.getById(id);
  } catch (error) {
    throw new HttpError(401, 'Authorization failed', error);
  }
};
