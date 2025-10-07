import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyPluginAsync } from 'fastify';
import { loginUser } from 'src/controllers/auth/login-user';
import { refreshAccessToken } from 'src/controllers/auth/refresh-access-token';
import { registerUser } from 'src/controllers/auth/register-user';
import {
  AccessTokenSchema,
  JwtTokensSchema,
  RefreshTokenSchema
} from 'src/types/JwtTokens';
import { RegisterUserReqSchema } from './schemas/RegisterUserReqSchema';
import { LoginUserReqSchema } from './schemas/LoginUserReqSchema';

const SCHEMA_TAGS = ['Auth'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { userRepo } = fastify.repos;
  const cognitoService = fastify.cognitoService;

  fastify.post(
    '/register',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: RegisterUserReqSchema
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req) => {
       await registerUser({
        userRepo,
        cognitoService,
        createData: { ...req.body },
        organizationRepo: fastify.repos.organizationRepo,
        userOrganizationRepo: fastify.repos.userOrganizationRepo,
        transactionService: fastify.transactionService,
        sendGridService: fastify.sendGridService
      });
    }
  );

  fastify.post(
    '/login',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: LoginUserReqSchema,
        response: { 200: JwtTokensSchema }
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req) => {
      return await loginUser({
        userRepo,
        cognitoService,
        email: req.body.email,
        password: req.body.password
      });
    }
  );

  fastify.post(
    '/refresh-token',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: RefreshTokenSchema,
        response: { 200: AccessTokenSchema }
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req) => {
      return await refreshAccessToken({
        cognitoService,
        refreshToken: req.body.refreshToken
      });
    }
  );
};

export default routes;
