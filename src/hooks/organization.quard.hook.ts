/* eslint-disable no-param-reassign */
import { preHandlerAsyncHookHandler } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';

export const organizationGuardHook: preHandlerAsyncHookHandler =
  async function (request) {
    if (request.routeOptions.config.skipUserOrganization) {
      return;
    }

    try {
      const { organizationId } = request.query as { organizationId: string };

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const userOrganizations = request.userProfile.userOrganizations || [];

      const userOrganization = userOrganizations.find(
        (uo) => uo.organizationId === organizationId
      );

      if (!userOrganization) {
        throw new Error('Access denied to the organization');
      }

      request.userOrganization = userOrganization;
    } catch (error) {
      throw new HttpError(403, 'Access denied to the organization', error);
    }
  };
