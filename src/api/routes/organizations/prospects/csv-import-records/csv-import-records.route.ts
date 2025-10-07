import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ImportProspectCsvResSchema } from './schemas/ImportProspectCsvResSchema';
import { importProspectsFromCsv } from 'src/controllers/csv-import-record/import-prospects-from-csv';
import { ApplicationError } from 'src/types/errors/ApplicationError';

const SCHEMA_TAGS = ['CSVImport'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  const { csvImportRecordRepo } = fastify.repos;
  const s3Service = fastify.s3Service;
  const sqsService = fastify.sqsService;

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: ImportProspectCsvResSchema }
      }
    },
    async (req) => {
      const parts = await req.parts();

      let buffer: Buffer | undefined;
      let mapping: Record<string, any> | undefined;

      for await (const part of parts) {
        if (part.type === 'file') {
          buffer = await part.toBuffer();
        }
  
        if (part.type === 'field' && part.fieldname === 'mapping') {
          mapping = JSON.parse(part.value as string);
        }
      }

      if (!buffer) {
        throw new ApplicationError('CSV file is required');
      }

      if (!mapping) {
        throw new ApplicationError('Mapping field is required');
      }

      return await importProspectsFromCsv({
        buffer,
        mapping,
        organizationId: req.userOrganization.organizationId,
        userId: req.userProfile.id,
        s3Service,
        sqsService,
        csvImportRecordRepo
      });
    }
  );
};

export default routes;
