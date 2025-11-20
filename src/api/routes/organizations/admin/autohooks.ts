 
import { FastifyPluginAsync } from 'fastify';
import { HttpError } from 'src/api/errors/HttpError';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';


const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', (request) => {
    // move to hook
  try {
    const userRole = request.userOrganization.role;
    if (userRole !== UserRoleEnum.ADMIN) {
      throw new Error('Access denied: Admin role required');
    }
  } catch (error) {
    throw new HttpError(403, 'Access denied', error);
  }
  });
};

export default hooks;
