import { updateUserById } from 'src/controllers/user/update-user-by-id';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';

describe('updateUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call userRepo.updateUser', async () => {
    await updateUserById({
      userId: 'user-123',
      userData: { name: 'New Name' },
      userRepo: mockUserRepo
    });

    expect(mockUserRepo.updateUser).toHaveBeenCalledWith('user-123', {
      name: 'New Name'
    });
  });

  it('should throw if db error', async () => {
    mockUserRepo.updateUser.mockRejectedValueOnce(new Error('DB error'));

    await expect(
      updateUserById({
        userId: 'user-123',
        userData: { name: 'New Name' },
        userRepo: mockUserRepo
      })
    ).rejects.toThrow('DB error');

    expect(mockUserRepo.updateUser).toHaveBeenCalledWith('user-123', {
      name: 'New Name'
    });
  });
});
