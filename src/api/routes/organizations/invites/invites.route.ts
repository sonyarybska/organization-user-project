import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { OrganizationInviteSchema } from 'src/types/OrganizationInvite';
import { getInvitesByOrganizationId } from 'src/controllers/invites/get-invites-by-organization-id';

const SCHEMA_TAGS = ['Invite'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  const {
    organizationInviteRepo
  } = fastify.repos;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        // should be resp schema
        response: { 200: OrganizationInviteSchema.array() }
      }
    },
    async (req) => {
      return await getInvitesByOrganizationId({
        organizationId: req.userOrganization.organizationId,
        organizationInviteRepo
      });
    }
  );
};

export default routes;
