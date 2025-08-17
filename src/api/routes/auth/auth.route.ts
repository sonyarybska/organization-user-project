import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyPluginAsync } from 'fastify';
import { loginUser } from 'src/controllers/auth/login-user';
import { refreshAccessToken } from 'src/controllers/auth/refresh-access-token';
import { LoginUserReqSchema } from 'src/api/routes/auth/schemas/LoginUserReqSchema';
import { AccessTokenSchema } from 'src/types/JwtTokens';
import { confirmEmail } from 'src/controllers/auth/confirm-email';
import z from 'zod';
import { HttpError } from 'src/api/errors/HttpError';

const SCHEMA_TAGS = ['Auth'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { userRepo } = fastify.repos;
  const jwt = fastify.jwt;

  const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRE;
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE;

  fastify.post(
    '/login',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: LoginUserReqSchema,
        response: { 200: AccessTokenSchema }
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      },
      preHandler: async (req) => {
        const { email } = req.body;
        const user = await userRepo.getByEmail(email);

        if (!user.isConfirm) {
          throw new HttpError(403, 'Email not confirmed');
        }
      }
    },
    async (req, res) => {
      const { accessToken, refreshToken } = await loginUser({
        userRepo,
        data: req.body,
        jwt,
        accessTokenExpiresIn,
        refreshTokenExpiresIn
      });

      res.setCookie('refreshToken', refreshToken);

      return { accessToken };
    }
  );

  fastify.get(
    '/refresh-token',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: AccessTokenSchema }
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req, res) => {
      const { accessToken, refreshToken } = await refreshAccessToken(
        jwt,
        req.cookies.refreshToken
      );

      res.clearCookie('refreshToken', { path: 'api/auth' });

      res.setCookie('refreshToken', refreshToken);

      return { accessToken };
    }
  );

  fastify.get(
    '/confirm-email',
    {
      schema: {
        tags: SCHEMA_TAGS,
        querystring: z.object({ token: z.string() })
      },
      config: {
        skipAuth: true,
        skipConfirmEmail: true,
        skipUserOrganization: true
      }
    },
    async (req) => {
      await confirmEmail({
        userRepo,
        token: req.query.token,
        jwt
      });

      return { message: 'Email confirmed successfully' };
    }
  );
};

export default routes;
