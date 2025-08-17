import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';

export const confirmationEmailGuardHook: preHandlerAsyncHookHandler =
  async function (request) {
    if (request.routeOptions.config.skipConfirmEmail) {
      return;
    }

    try {
      if (!request.userProfile.isConfirm) {
        throw new Error('Email not confirmed');
      }
    } catch (error) {
      throw new HttpError(403, 'Email confirmation required', error);
    }
  };
