import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createOrganizationInvite } from 'src/controllers/invites/create-organization-invite';
import { InviteIdUUIDSchema } from 'src/api/routes/organizations/admin/invites/schemas/InviteIdUUIDSchema';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { CreateOrganizationInviteReqSchema } from '../../invites/schemas/CreateOrganizationInviteReqSchema';
import { declineOrganizationInviteByAdmin } from 'src/controllers/invites/decline-organization-invite-by-admin';

const SCHEMA_TAGS = ['Admin'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const sendGridService = fastify.sendGridService;
  const hmacService = fastify.hmacService;
  const { organizationRepo, organizationInviteRepo } = fastify.repos;

  // as for me you don't need admin folder
  // just put on invites and check user role in preHandler hook
  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateOrganizationInviteReqSchema
      }
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
    '/:inviteId/decline',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: InviteIdUUIDSchema
      }
    },
    async (req) => {
      await declineOrganizationInviteByAdmin({
        inviteId: req.params.inviteId,
        organizationInviteRepo,
        status: InviteStatus.DECLINED_BY_ADMIN,
        organizationId: req.userOrganization.organizationId
      });
    }
  );
};

export default routes;
