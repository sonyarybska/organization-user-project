import { updateUserById } from 'src/controllers/user/update-user-by-id';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { TEST_TRACKING_CONTEXT, TEST_USER_IDS } from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

describe('updateUserById', () => {
  const updatedData = { name: 'Updated Name' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful update', () => {
    it('updates user data via repository', async () => {
      await updateUserById({
        userId: TEST_USER_IDS.FIRST,
        userData: updatedData,
        userRepo: mockUserRepo,
        trackingService: trackingServiceMock,
        trackingContext: TEST_TRACKING_CONTEXT
      });

      expect(mockUserRepo.updateUser).toHaveBeenCalledWith(TEST_USER_IDS.FIRST, updatedData);
    });
  });

  describe('on update failure', () => {
    it('propagates database error', async () => {
      const dbError = new Error('Connection timeout');
      mockUserRepo.updateUser.mockRejectedValue(dbError);

      await expect(
        updateUserById({
          userId: TEST_USER_IDS.FIRST,
          userData: updatedData,
          userRepo: mockUserRepo,
          trackingService: trackingServiceMock,
          trackingContext: TEST_TRACKING_CONTEXT
        })
      ).rejects.toThrow('Connection timeout');

      expect(mockUserRepo.updateUser).toHaveBeenCalledWith(TEST_USER_IDS.FIRST, updatedData);
    });
  });
});
