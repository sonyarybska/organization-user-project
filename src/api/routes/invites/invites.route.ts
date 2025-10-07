import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { joinUserToOrganization } from 'src/controllers/invites/join-to-organization';
import { declineOrganizationInvite } from 'src/controllers/invites/decline-organization-invite';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { TokenReqSchema } from './schemas/TokenReqSchema';

const SCHEMA_TAGS = ['Invite'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();

  const { userOrganizationRepo, organizationInviteRepo, userRepo } =
    fastify.repos;
  const cognitoService = fastify.cognitoService;
  const transactionService = fastify.transactionService;
  const hmacService = fastify.hmacService;

  fastify.post(
    '/join',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: TokenReqSchema
      },
      config: {
        skipUserOrganization: true,
        skipAuth: true,
        skipConfirmEmail: true
      }
    },
    async (req) => {
      await joinUserToOrganization({
        token: req.body.token,
        userOrganizationRepo,
        organizationInviteRepo,
        userRepo,
        cognitoService,
        transactionService,
        hmacService
      });
    }
  );

  fastify.patch(
    '/decline',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: TokenReqSchema
      },
      config: {
        skipUserOrganization: true,
        skipAuth: true,
        skipConfirmEmail: true
      }
    },
    async (req) => {
      await declineOrganizationInvite({
        token: req.body.token,
        organizationInviteRepo,
        status: InviteStatus.DECLINED_BY_USER,
        hmacService
      });
    }
  );
};

export default routes;
