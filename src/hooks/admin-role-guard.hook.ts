import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';

export const adminRoleGuardHook: preHandlerAsyncHookHandler = async function (
  request
) {
  if (!request.routeOptions.config.checkAdminRole) {
    return;
  }

  try {
    const userRole = request.userOrganization.role;
    if (userRole !== UserRoleEnum.ADMIN) {
      throw new Error('Access denied: Admin role required');
    }
  } catch (error) {
    throw new HttpError(403, 'Access denied', error);
  }
};
