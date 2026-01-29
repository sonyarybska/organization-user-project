import { registerUser } from 'src/controllers/auth/register-user';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import {
  mockOrganizationRepo
} from 'src/tests/mocks/repos/organization.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { createTestOrganization, createTestUser } from 'src/tests/fixtures/test-factories';

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create cognito user and persist org + user + membership in transaction', async () => {
    const testOrganization = createTestOrganization();
    const testUser  = createTestUser();
    
    const connection = { entityManager: {} as any };

    const transactionService = {
      run: jest.fn(async (cb: any) => cb(connection))
    };

    mockCognitoService.createCognitoUser.mockResolvedValueOnce('cognito-123');

    mockOrganizationRepo.create.mockResolvedValueOnce(testOrganization);

    mockUserRepo.create.mockResolvedValueOnce(testUser);

    await registerUser({
      userRepo: mockUserRepo,
      organizationRepo: mockOrganizationRepo,
      userOrganizationRepo: mockUserOrganizationRepo,
      transactionService,
      sendGridService: mockSendGridService,
      cognitoService: mockCognitoService,
      createData: {
        organizationName: testOrganization.name,
        name: testUser.name!,
        email: testUser.email,
        password: 'pass',
        companyName: testUser.companyName!,
        companyUrl: testUser.companyUrl!,
        birthday: testUser.birthday!
      }
    });

    expect(mockCognitoService.createCognitoUser).toHaveBeenCalledWith(
      testUser.email,
      'pass'
    );

    expect(transactionService.run).toHaveBeenCalledTimes(1);

    expect(mockOrganizationRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockOrganizationRepo.create).toHaveBeenCalledWith({ name: testOrganization.name });

    expect(mockUserRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockUserRepo.create).toHaveBeenCalledWith({
      name: testUser.name!,
      email: testUser.email,
      companyName: testUser.companyName!,
      companyUrl: testUser.companyUrl!,
      birthday: testUser.birthday!,
      cognitoUserId: 'cognito-123'
    });

    expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(connection);
    expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
      userId: testUser.id,
      organizationId: testOrganization.id,
      role: UserRoleEnum.ADMIN
    });
  });

  it('should not start transaction if cognito create fails', async () => {
    const transactionService = {
      run: jest.fn(async (cb: any) => cb({ entityManager: {} as any }))
    };

    mockCognitoService.createCognitoUser.mockRejectedValueOnce(
      new Error('Cognito sign up error')
    );

    await expect(
      registerUser({
        userRepo: mockUserRepo,
        organizationRepo: mockOrganizationRepo,
        userOrganizationRepo: mockUserOrganizationRepo,
        transactionService,
        sendGridService: mockSendGridService,
        cognitoService: mockCognitoService,
        createData: {
          name: 'New User',
          organizationName: 'Acme',
          email: 'new@test.com',
          password: 'pass',
          companyName: 'Company',
          companyUrl: 'https://company.example',
          birthday: new Date('2000-01-01T00:00:00.000Z')
        }
      })
    ).rejects.toThrow('Cognito sign up error');

    expect(transactionService.run).not.toHaveBeenCalled();
  });

  it('should throw on transaction error', async () => {
    const connection = { entityManager: {} as any };

    const transactionService = {
      run: jest.fn(async (cb: any) => cb(connection))
    };

    mockCognitoService.createCognitoUser.mockResolvedValueOnce('cognito-123');
    mockOrganizationRepo.create.mockRejectedValueOnce(new Error('DB error'));

    await expect(
      registerUser({
        userRepo: mockUserRepo,
        organizationRepo: mockOrganizationRepo,
        userOrganizationRepo: mockUserOrganizationRepo,
        transactionService,
        sendGridService: mockSendGridService,
        cognitoService: mockCognitoService,
        createData: {
          name: 'New User',
          organizationName: 'Acme',
          email: 'new@test.com',
          password: 'pass',
          companyName: 'Company',
          companyUrl: 'https://company.example',
          birthday: new Date('2000-01-01T00:00:00.000Z')
        }
      })
    ).rejects.toThrow('DB error');

    expect(mockUserRepo.create).not.toHaveBeenCalled();
    expect(mockUserOrganizationRepo.create).not.toHaveBeenCalled();
  });
});
