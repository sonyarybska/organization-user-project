import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createProspect } from 'src/controllers/prospect/create-prospect';
import { getProspectsByOrganizationId } from 'src/controllers/prospect/get-prospects-by-organization-id';
import { ProspectSchema } from 'src/types/Prospect';
import { getProspectByIdAndOrgId } from 'src/controllers/prospect/get-prospect-by-id-and-org-id';
import { CreateProspectReqSchema } from './schemas/CreateProspectReqSchema';
import { IdUUIDSchema } from 'src/api/common/schemas/IdUUIDSchema';

const SCHEMA_TAGS = ['Prospect'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { prospectRepo } = fastify.repos;

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateProspectReqSchema,
        response: { 200: IdUUIDSchema }
      }
    },
    async (req) => {
      return await createProspect({
        prospectRepo,
        data: {
          ...req.body,
          organizationId: req.userOrganization.organizationId,
          userId: req.userProfile.id
        }
      });
    }
  );

  fastify.get(
    '/',
    {
      // separate resp schema
      schema: { tags: SCHEMA_TAGS, response: { 200: ProspectSchema.array() } }
    },
    // add pagination
    async (req) => {
      return await getProspectsByOrganizationId({
        prospectRepo,
        organizationId: req.userOrganization.organizationId
      });
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema,
        // separate resp schema
        response: { 200: ProspectSchema }
      }
    },
    async (req) => {
      return await getProspectByIdAndOrgId({
        id: req.params.id,
        organizationId: req.userOrganization.organizationId,
        prospectRepo
      });
    }
  );
  // delete
};

export default routes;
