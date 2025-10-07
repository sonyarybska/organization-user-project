import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getUserById } from 'src/controllers/user/get-user-by-id';
import { updateUserById } from 'src/controllers/user/update-user-by-id';
import { UpdateUserReqSchema } from '../organizations/users/schemas/UpdateUserReqSchema';
import { UserResSchema } from 'src/api/common/schemas/UserResSchema';

const SCHEMA_TAGS = ['Me', 'Organization'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { userRepo } = fastify.repos;
  const s3Service = fastify.s3Service;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: UserResSchema }
      },
      config: {
        skipUserOrganization: true
      }
    },
    async (req) => {
      const { id } = req.userProfile;
      return await getUserById({
        userId: id,
        userRepo,
        s3Service
      });
    }
  );

  fastify.patch(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: UpdateUserReqSchema
      },
      config: {
        skipUserOrganization: true
      }
    },
    async (req) => {
      const { id } = req.userProfile;
       await updateUserById({
        userId: id,
        userData: req.body,
        userRepo
      });
    }
  );
};

export default routes;
