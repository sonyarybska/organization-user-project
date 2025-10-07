import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreateOrganizationReqSchema } from './schemas/CreateOrganizationReqSchema';
import { createOrganization } from 'src/controllers/organization/create-organization';

const SCHEMA_TAGS = ['Organization'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const transactionService = fastify.transactionService;
  const {
    organizationRepo,
    userOrganizationRepo
  } = fastify.repos;

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateOrganizationReqSchema
      },
      config: { skipUserOrganization: true }
    },
    async (req) => {
      const { id } = req.userProfile;

     await createOrganization({
        organizationRepo,
        userOrganizationRepo,
        organizationData: req.body,
        transactionService,
        userId: id
      });
    }
  );
};

export default routes;
