import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createCompany } from 'src/controllers/company/create-company';
import { getCompanyByIdAndOrgId } from 'src/controllers/company/get-company-by-id-and-org-id';
import { updateCompanyByIdAndOrgId } from 'src/controllers/company/update-company-by-id-and-org-id';
import { deleteCompanyByIdAndOrgId } from 'src/controllers/company/delete-company-by-id-and-org-id';
import { IdUUIDSchema } from '../schemas/IdUUIDSchema';
import { CompanyResSchema } from './schemas/CompanyResSchema';
import { UpdateCompanyReqSchema } from './schemas/UpdateCompanyReqSchema';
import { CreateCompanyReqSchema } from './schemas/CreateCompanyReqSchema';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';

const SCHEMA_TAGS = ['Company'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { companyRepo } = fastify.repos;

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateCompanyReqSchema,
        response: { 200: CompanyResSchema }
      }
    },
    async (req) => {
      return await createCompany({
        companyData: {
          ...req.body,
          source: SourceTypeEnum.MANUAL,
          organizationId: req.userOrganization.organizationId
        },
        companyRepo
      });
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema,
        response: { 200: CompanyResSchema }
      }
    },
    async (req) => {
      return await getCompanyByIdAndOrgId({
        id: req.params.id,
        organizationId: req.userOrganization.organizationId,
        companyRepo
      });
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema,
        body: UpdateCompanyReqSchema
      }
    },
    async (req) => {
      await updateCompanyByIdAndOrgId({
        id: req.params.id,
        organizationId: req.userOrganization.organizationId,
        companyData: req.body,
        companyRepo
      });
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema
      }
    },
    async (req) => {
      await deleteCompanyByIdAndOrgId({
        id: req.params.id,
        organizationId: req.userOrganization.organizationId,
        companyRepo
      });
    }
  );
};

export default routes;
