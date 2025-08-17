import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { CreateUserReqSchema } from 'src/api/routes/users/schemas/CreateUserReqSchema';
import { createUser } from 'src/controllers/user/create-user';

import { CreateUserResSchema } from './schemas/CreateUserResSchema';
import { UpdateUserReqSchema } from './schemas/UpdateUserReqSchema';
import { updateUserById } from 'src/controllers/user/update-user-by-id';
import { getUserById } from 'src/controllers/user/get-user-by-id';
import { GetUserResSchema } from './schemas/GetUserResSchema';

const SCHEMA_TAGS = ['User'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const transactionService = fastify.transactionService;
  const { userRepo, organizationRepo, userOrganizationRepo } = fastify.repos;
  const sendGridService = fastify.sendGridService;
  const jwt = fastify.jwt;
  const s3Service = fastify.s3Service;
  const expiresIn = process.env.JWT_CONFIRM_EMAIL_TOKEN_EXPIRE;
  const expireInSeconds = Number(process.env.AWS_SIGNED_URL_EXPIRE_IN_SEC);

  fastify.get(
    '/me',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: GetUserResSchema }
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
        s3Service,
        expireInSeconds
      });
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateUserReqSchema,
        response: { 200: CreateUserResSchema }
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req) => {
      return await createUser({
        userRepo,
        organizationRepo,
        userOrganizationRepo,
        transactionService,
        data: req.body,
        sendGridService,
        jwt,
        expiresIn
      });
    }
  );

  fastify.patch(
    '/me/',
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
      return await updateUserById({ userId: id, data: req.body, userRepo, s3Service, expireInSeconds });
    }
  );
};

export default routes;
