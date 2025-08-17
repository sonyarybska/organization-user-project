import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CreateOrganizationReqSchema } from './schemas/CreateOrganizationReqSchema';
import { createOrganization } from 'src/controllers/organization/create-organization';
import { CreateOrganizationInviteReqSchema } from './schemas/CreateOrganizationInviteReqSchema';
import { createOrganizationInvite } from 'src/controllers/organization/create-organization-invite';
import { InvitationUuidSchema } from './schemas/InvitationUuidSchema';
import { joinUserToOrganization } from 'src/controllers/organization/join-to-organization';
import { declineOrganizationInvite } from 'src/controllers/organization/decline-organization-invite';
import { OrganizationSchema } from 'src/types/Organization';
import { OrganizationInvitationSchema } from 'src/types/OrganizationInvitation';
import { getOrganizationInvitations } from 'src/controllers/organization/get-organization-invites';
import { OrganizationIdSchema } from 'src/api/common';

const SCHEMA_TAGS = ['Organization'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const transactionService = fastify.transactionService;
  const sendGridService = fastify.sendGridService;
  const {
    organizationRepo,
    userOrganizationRepo,
    organizationInvitationRepo,
    userRepo
  } = fastify.repos;

  const inviteTokenExpireInMillis = Number(
    process.env.INVITE_TOKEN_EXPIRE_IN_MILLIS
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateOrganizationReqSchema,
        response: { 200: OrganizationSchema }
      },
      config: { skipUserOrganization: true }
    },
    async (req) => {
      const { id } = req.userProfile;

      const organization = await createOrganization({
        organizationRepo,
        userOrganizationRepo,
        data: req.body,
        transactionService,
        userId: id
      });

      return organization;
    }
  );

  fastify.post(
    '/invite',
    {
      schema: {
        tags: SCHEMA_TAGS,
        body: CreateOrganizationInviteReqSchema,
        querystring: OrganizationIdSchema,
        response: { 200: InvitationUuidSchema }
      },
      config: { checkAdminRole: true }
    },
    async (req) => {
      return await createOrganizationInvite({
        email: req.body.email,
        organizationId: req.query.organizationId,
        sendGridService,
        organizationRepo,
        userRepo,
        organizationInvitationRepo,
        inviteTokenExpireInMillis,
        userId: req.userProfile.id
      });
    }
  );

  fastify.get(
    '/join/:invitationId',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: InvitationUuidSchema
      },
      config: { skipUserOrganization: true }
    },
    async (req) => {
      const { id, email } = req.userProfile;

      await joinUserToOrganization({
        invitationId: req.params.invitationId,
        userId: id,
        email,
        userOrganizationRepo,
        organizationInvitationRepo
      });

      return { message: 'Successfully joined the organization' };
    }
  );

  fastify.post(
    '/invite/decline/:invitationId',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: InvitationUuidSchema
      },
      config: { skipUserOrganization: true }
    },
    async (req) => {
      await declineOrganizationInvite(
        req.params.invitationId,
        organizationInvitationRepo
      );

      return { message: 'Invitation declined successfully' };
    }
  );

  fastify.get(
    '/invites',
    {
      schema: {
        tags: SCHEMA_TAGS,
        querystring: OrganizationIdSchema,
        response: { 200: OrganizationInvitationSchema.array() }
      }
    },
    async (req) => {
      const { id } = req.userProfile;

      return await getOrganizationInvitations({
        userId: id,
        organizationId: req.query.organizationId,
        organizationInvitationRepo
      });
    }
  );
};

export default routes;
