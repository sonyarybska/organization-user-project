import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getUsersByOrganizationId } from 'src/controllers/user/get-users-by-organization-id';
import { UserResSchema } from '../../schemas/UserResSchema';

const SCHEMA_TAGS = ['User'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { userRepo } = fastify.repos;
  const s3Service = fastify.s3Service;

  fastify.get(
    '/',
    { schema: { tags: SCHEMA_TAGS, response: { 200: UserResSchema.array() } } },
    async (req) => {
      return await getUsersByOrganizationId({
        organizationId: req.userOrganization.organizationId,
        userRepo,
        s3Service
      });
    }
  );
};

export default routes;
