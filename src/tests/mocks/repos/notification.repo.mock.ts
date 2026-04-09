import { jest } from '@jest/globals';
import { INotificationRepo } from 'src/repos/notification.repo';

export const mockNotificationRepo: jest.Mocked<INotificationRepo> = {
  reconnect: jest.fn(),
  create: jest.fn(),
  getByUserId: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  countUnread: jest.fn()
};

mockNotificationRepo.reconnect.mockImplementation(() => mockNotificationRepo);
