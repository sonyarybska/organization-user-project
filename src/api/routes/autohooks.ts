import { FastifyPluginAsync } from 'fastify';
import { adminRoleGuardHook } from 'src/hooks/admin-role-guard.hook';
import { authHook } from 'src/hooks/auth.hook';
import { confirmationEmailGuardHook } from 'src/hooks/confirmation-email-guard.hook';
import { organizationGuardHook } from 'src/hooks/organization.quard.hook';

const hooks: FastifyPluginAsync = async function (fastify) {
  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', confirmationEmailGuardHook);
  fastify.addHook('preHandler', organizationGuardHook);
  fastify.addHook('preHandler', adminRoleGuardHook);
};

export default hooks;
