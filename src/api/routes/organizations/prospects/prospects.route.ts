import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createProspect } from 'src/controllers/prospect/create-prospect';
import { getProspectsByOrganizationId } from 'src/controllers/prospect/get-prospects-by-organization-id';
import { getProspectByIdAndOrgId } from 'src/controllers/prospect/get-prospect-by-id-and-org-id';
import { CreateProspectReqSchema } from './schemas/CreateProspectReqSchema';
import { IdUUIDSchema } from '../../schemas/IdUUIDSchema';
import { ProspectResSchema } from './schemas/ProspectResSchema';
import { PaginatedProspectsResSchema } from './schemas/PaginatedProspectsResSchema';
import { deleteProspectsByIdAndOrganizationId } from 'src/controllers/prospect/delete-prospects-by-id-and-organization-id';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';

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
          userId: req.userProfile.id,
          source: SourceTypeEnum.MANUAL
        }
      });
    }
  );

  fastify.get(
    '/',
    {
      schema: { tags: SCHEMA_TAGS, response: { 200: PaginatedProspectsResSchema } }
    },
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
        response: { 200: ProspectResSchema }
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

  fastify.delete('/:id', 
    {
      schema: {
        tags:SCHEMA_TAGS,
        params:IdUUIDSchema
      }
    },
    async (req) => {
      await deleteProspectsByIdAndOrganizationId({
        id: req.params.id,
        organizationId: req.userOrganization.organizationId,
        prospectRepo
      });
    }
  );
};

export default routes;
