import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getInvitesByEmail } from 'src/controllers/invites/get-invites-by-email';
import { OrganizationInviteSchema } from 'src/types/OrganizationInvite';

const SCHEMA_TAGS = ['Invite'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { organizationInviteRepo } = fastify.repos;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response:{ 200:OrganizationInviteSchema.array() }
      }
    },
    async (req) => {
      return await getInvitesByEmail({
        email: req.userProfile.email,
        organizationInviteRepo
      });
    }
  );
};

export default routes;
