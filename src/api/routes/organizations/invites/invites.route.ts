import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getInvitesByOrganizationId } from 'src/controllers/invites/get-invites-by-organization-id';
import { OrganizationInviteResSchema } from './schemas/OrganizationInviteResSchema';
import { CreateOrganizationInviteReqSchema } from './schemas/CreateOrganizationInviteReqSchema';
import { createOrganizationInvite } from 'src/controllers/invites/create-organization-invite';
import { declineOrganizationInviteByAdmin } from 'src/controllers/invites/decline-organization-invite-by-admin';
import { IdUUIDSchema } from '../../schemas/IdUUIDSchema';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { checkAdminHook } from 'src/hooks/check-admin.hook';

const SCHEMA_TAGS = ['Invite'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const {
    organizationInviteRepo,
    organizationRepo
  } = fastify.repos;
  const sendGridService = fastify.sendGridService;
  const hmacService = fastify.hmacService;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        response: { 200: OrganizationInviteResSchema.array() }
      }
    },
    async (req) => {
      return await getInvitesByOrganizationId({
        organizationId: req.userOrganization.organizationId,
        organizationInviteRepo
      });
    }
  );

    fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateOrganizationInviteReqSchema
      },
      preHandler:checkAdminHook
    },
    async (req) => {
      await createOrganizationInvite({
        email: req.body.email,
        organizationId: req.userOrganization.organizationId,
        sendGridService,
        organizationRepo,
        organizationInviteRepo,
        userId: req.userProfile.id,
        hmacService
      });
    }
  );

  fastify.patch(
    '/:id/decline',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema
      },
      preHandler:checkAdminHook
    },
    async (req) => {
      await declineOrganizationInviteByAdmin({
        inviteId: req.params.id,
        organizationInviteRepo,
        status: InviteStatus.DECLINED_BY_ADMIN,
        organizationId: req.userOrganization.organizationId
      });
    }
  );
};

export default routes;
