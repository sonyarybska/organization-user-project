import { FastifyPluginAsync } from 'fastify';
import { authHook } from 'src/hooks/auth.hook';
import { organizationGuardHook } from 'src/hooks/organization.guard.hook';

const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', organizationGuardHook);
};

export default hooks;
