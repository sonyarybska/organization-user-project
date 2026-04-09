import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getNotifications } from 'src/controllers/notification/get-notifications';
import { markNotificationAsRead } from 'src/controllers/notification/mark-notification-as-read';
import { markAllNotificationsAsRead } from 'src/controllers/notification/mark-all-notifications-as-read';
import { getUnreadCount } from 'src/controllers/notification/get-unread-count';
import { IdUUIDSchema } from '../../schemas/IdUUIDSchema';
import { GetNotificationsQuerySchema } from './schemas/GetNotificationsQuerySchema';
import { GetNotificationsResSchema } from './schemas/GetNotificationsResSchema';
import { GetUnreadCountResSchema } from './schemas/GetUnreadCountResSchema';
import { GetUnreadCountQuerySchema } from './schemas/GetUnreadCountQuerySchema';
import { ReadAllNotificationQuerySchema } from './schemas/ReadAllNotificationQuerySchema';

const SCHEMA_TAGS = ['Notifications'];

const routes: FastifyPluginAsync = async (f) => {
  const fastify = f.withTypeProvider<ZodTypeProvider>();
  const { notificationRepo } = fastify.repos;

  fastify.get(
    '/',
    {
      schema: {
        tags: SCHEMA_TAGS,
        querystring: GetNotificationsQuerySchema,
        response: { 200: GetNotificationsResSchema }
      }
    },
    async (req) => {
      return await getNotifications({
        userId: req.userProfile.id,
        organizationId: req.query.organizationId,
        isRead: req.query.isRead,
        pagination: {
          limit: req.query.limit,
          offset: req.query.offset
        },
        notificationRepo
      });
    }
  );

  fastify.get(
    '/unread-count',
    {
      schema: {
        tags: SCHEMA_TAGS,
        querystring: GetUnreadCountQuerySchema,
        response: { 200: GetUnreadCountResSchema }
      }
    },
    async (req) => {
      return await getUnreadCount({
        userId: req.userProfile.id,
        organizationId: req.query.organizationId,
        notificationRepo
      });
    }
  );

  fastify.patch(
    '/:id/read',
    {
      schema: {
        tags: SCHEMA_TAGS,
        params: IdUUIDSchema
      }
    },
    async (req) => {
      await markNotificationAsRead({
        id: req.params.id,
        userId: req.userProfile.id,
        notificationRepo
      });
    }
  );

  fastify.patch(
    '/read-all',
    {
      schema: {
        tags: SCHEMA_TAGS,
        querystring: ReadAllNotificationQuerySchema
      }
    },
    async (req) => {
      await markAllNotificationsAsRead({
        userId: req.userProfile.id,
        organizationId: req.query.organizationId,
        notificationRepo
      });
    }
  );
};

export default routes;
