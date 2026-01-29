import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getOrganizationsByUserId } from 'src/controllers/organization/get-organizations-by-user-id';
import { OrganizationSchema } from 'src/types/Organization';

const SCHEMA_TAGS = ['Organization'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { organizationRepo } = fastify.repos;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response:{ 200:OrganizationSchema.array() }
        
      },
      config: {
        skipUserOrganization: true
      }
    },
    async (req) => {
      return await getOrganizationsByUserId({
        userId: req.userProfile.id,
        organizationRepo
      });
    }
  );
};

export default routes;
