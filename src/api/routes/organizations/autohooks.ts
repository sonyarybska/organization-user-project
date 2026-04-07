import { FastifyPluginAsync } from 'fastify';
import { organizationGuardHook } from 'src/hooks/organization.guard.hook';

const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', organizationGuardHook);
};

export default hooks;
