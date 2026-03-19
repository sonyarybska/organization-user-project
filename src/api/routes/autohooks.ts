import { FastifyPluginAsync } from 'fastify';
import { authHook } from 'src/hooks/auth.hook';
import { organizationGuardHook } from 'src/hooks/organization.guard.hook';
import { trackingContextHook } from 'src/hooks/tracking-context.hook';

const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', trackingContextHook);
  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', organizationGuardHook);
};

export default hooks;
