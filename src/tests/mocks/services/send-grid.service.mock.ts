import { jest } from '@jest/globals';
import { ISendGridService } from 'src/services/send-grid/send-grid.service';

export const mockSendGridService: jest.Mocked<ISendGridService> = {
  sendInviteEmail: jest.fn()
};
