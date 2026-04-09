import { NotificationEntity } from 'src/services/typeorm/entities/NotificationEntity';
import { Notification } from 'src/types/Notification';
import { Pagination } from 'src/api/routes/schemas/PaginationSchema';
import { DBError } from 'src/types/errors/DBError';
import { Reconnector } from 'src/types/interfaces/Reconnector';
import { TypeOrmConnection } from 'src/types/interfaces/TypeOrmConnection';
import { DataSource, EntityManager } from 'typeorm';

export interface INotificationRepo extends Reconnector<INotificationRepo, TypeOrmConnection> {
  create(data: Partial<Notification>): Promise<Notification>;
  getByUserId(
    userId: string,
    pagination: Pagination,
    filters?: { organizationId?: string; isRead?: boolean }
  ): Promise<{ notifications: Notification[]; total: number }>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string, organizationId?: string): Promise<void>;
  countUnread(userId: string, organizationId?: string): Promise<number>;
}

export function getNotificationRepo(db: DataSource | EntityManager): INotificationRepo {
  const notificationRepo = db.getRepository<NotificationEntity>(NotificationEntity);

  return {
    reconnect(connection: TypeOrmConnection): INotificationRepo {
      return getNotificationRepo(connection.entityManager);
    },

    async create(data: Partial<Notification>): Promise<Notification> {
      try {
        const result = await notificationRepo
          .createQueryBuilder()
          .insert()
          .into(NotificationEntity)
          .values(data as NotificationEntity)
          .returning('*')
          .execute();

        if (!result.raw[0]) {
          throw new DBError('Failed to create notification');
        }

        return result.raw[0] as Notification;
      } catch (error) {
        throw new DBError('Failed to create notification', error);
      }
    },

    async getByUserId(
      userId: string,
      pagination: Pagination,
      filters?: { organizationId?: string; isRead?: boolean }
    ): Promise<{ notifications: Notification[]; total: number }> {
      try {
        const query = notificationRepo.createQueryBuilder('notification').where('notification.userId = :userId', { userId });

        if (filters?.organizationId) {
          query.andWhere('notification.organizationId = :organizationId', {
            organizationId: filters.organizationId
          });
        }

        if (filters?.isRead !== undefined) {
          query.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
        }

        query.orderBy('notification.createdAt', 'DESC');

        if (pagination?.limit) {
          query.take(pagination.limit);
        }

        if (pagination?.offset) {
          query.skip(pagination.offset);
        }

        const [notifications, total] = await query.getManyAndCount();

        return { notifications, total };
      } catch (error) {
        throw new DBError(`Failed to fetch notifications for user ${userId}`, error);
      }
    },

    async markAsRead(id: string, userId: string): Promise<void> {
      try {
        const result = await notificationRepo
          .createQueryBuilder()
          .update(NotificationEntity)
          .set({ isRead: true, readAt: new Date() })
          .where('id = :id', { id })
          .andWhere('userId = :userId', { userId })
          .execute();

        if (result.affected === 0) {
          throw new DBError(`Notification with id ${id} not found for user ${userId}`);
        }
      } catch (error) {
        throw new DBError(`Failed to mark notification ${id} as read`, error);
      }
    },

    async markAllAsRead(userId: string, organizationId?: string): Promise<void> {
      try {
        const query = notificationRepo
          .createQueryBuilder()
          .update(NotificationEntity)
          .set({ isRead: true, readAt: new Date() })
          .where('userId = :userId', { userId })
          .andWhere('isRead = :isRead', { isRead: false });

        if (organizationId) {
          query.andWhere('organizationId = :organizationId', { organizationId });
        }

        await query.execute();
      } catch (error) {
        throw new DBError(`Failed to mark all notifications as read for user ${userId}`, error);
      }
    },

    async countUnread(userId: string, organizationId?: string): Promise<number> {
      try {
        const query = notificationRepo
          .createQueryBuilder('notification')
          .where('notification.userId = :userId', { userId })
          .andWhere('notification.isRead = :isRead', { isRead: false });

        if (organizationId) {
          query.andWhere('notification.organizationId = :organizationId', { organizationId });
        }

        return await query.getCount();
      } catch (error) {
        throw new DBError(`Failed to count unread notifications for user ${userId}`, error);
      }
    }
  };
}
