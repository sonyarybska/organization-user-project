import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { IdUUIDSchema } from 'src/api/common/schemas/IdUUIDSchema';
import { createAttachment } from 'src/controllers/attachment/create-attachment';

const SCHEMA_TAGS = ['Attachment'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { attachmentRepo } = fastify.repos;
  const s3Service = fastify.s3Service;

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: IdUUIDSchema }
      },
      config: {
        skipUserOrganization: true
      }
    },
    async (req) => {
      const data = await req.file();

      return await createAttachment({
        attachmentRepo,
        s3Service,
        attachmentData: {
          originalName: data!.filename,
          userId: req.userProfile.id,
          buffer: await data!.toBuffer(),
          fileSizeInBytes: data!.file.bytesRead // ???
        }
      });
    }
  );
};

export default routes;
