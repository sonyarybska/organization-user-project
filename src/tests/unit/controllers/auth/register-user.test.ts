import { registerUser } from 'src/controllers/auth/register-user';
import { mockUserRepo } from 'src/tests/mocks/repos/user.repo.mock';
import { mockOrganizationRepo } from 'src/tests/mocks/repos/organization.repo.mock';
import { mockUserOrganizationRepo } from 'src/tests/mocks/repos/user-organization.repo.mock';
import { mockCognitoService } from 'src/tests/mocks/services/cognito.service.mock';
import { mockSendGridService } from 'src/tests/mocks/services/send-grid.service.mock';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { createTestOrganization, createTestUser } from 'src/tests/fixtures/test-factories';
import {
  TEST_EMAILS,
  TEST_PASSWORDS,
  TEST_ORG_NAMES,
  TEST_COMPANY_DATA,
  TEST_DATES,
  TEST_IDS,
  TEST_TRACKING_CONTEXT
} from 'src/tests/fixtures/test-constants';
import { trackingServiceMock } from 'src/tests/mocks/services/tracking.service.mock';

const COGNITO_USER_ID = TEST_IDS.COGNITO_1;

describe('registerUser', () => {
  const mockConnection = { entityManager: {} as any };
  const mockTransactionService = {
    run: jest.fn(async (cb: any) => cb(mockConnection))
  };

  const registrationData = {
    organizationName: TEST_ORG_NAMES.TECH_CORP,
    name: 'John Doe',
    email: TEST_EMAILS.VALID_USER,
    password: TEST_PASSWORDS.VALID,
    companyName: TEST_COMPANY_DATA.name,
    companyUrl: TEST_COMPANY_DATA.url,
    birthday: TEST_DATES.BIRTHDAY
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on successful registration', () => {
    it('creates cognito user and persists organization with admin user in transaction', async () => {
      const testOrganization = createTestOrganization({ name: TEST_ORG_NAMES.TECH_CORP });
      const testUser = createTestUser({
        email: TEST_EMAILS.VALID_USER,
        cognitoUserId: COGNITO_USER_ID
      });

      mockCognitoService.createCognitoUser.mockResolvedValue(COGNITO_USER_ID);
      mockOrganizationRepo.create.mockResolvedValue(testOrganization);
      mockUserRepo.create.mockResolvedValue(testUser);

      await registerUser({
        userRepo: mockUserRepo,
        organizationRepo: mockOrganizationRepo,
        userOrganizationRepo: mockUserOrganizationRepo,
        transactionService: mockTransactionService,
        sendGridService: mockSendGridService,
        cognitoService: mockCognitoService,
        createData: registrationData,
        trackingContext:TEST_TRACKING_CONTEXT,
        trackingService: trackingServiceMock
      });

      expect(mockCognitoService.createCognitoUser).toHaveBeenCalledWith(TEST_EMAILS.VALID_USER, TEST_PASSWORDS.VALID);

      expect(mockTransactionService.run).toHaveBeenCalledTimes(1);

      expect(mockOrganizationRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockOrganizationRepo.create).toHaveBeenCalledWith({ name: TEST_ORG_NAMES.TECH_CORP });

      expect(mockUserRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        name: registrationData.name,
        email: TEST_EMAILS.VALID_USER,
        companyName: TEST_COMPANY_DATA.name,
        companyUrl: TEST_COMPANY_DATA.url,
        birthday: TEST_DATES.BIRTHDAY,
        cognitoUserId: COGNITO_USER_ID
      });

      expect(mockUserOrganizationRepo.reconnect).toHaveBeenCalledWith(mockConnection);
      expect(mockUserOrganizationRepo.create).toHaveBeenCalledWith({
        userId: testUser.id,
        organizationId: testOrganization.id,
        role: UserRoleEnum.ADMIN
      });
    });
  });

  describe('on cognito failure', () => {
    it('does not start transaction when cognito user creation fails', async () => {
      const cognitoError = new Error('User already exists');
      mockCognitoService.createCognitoUser.mockRejectedValue(cognitoError);

      await expect(
        registerUser({
          userRepo: mockUserRepo,
          organizationRepo: mockOrganizationRepo,
          userOrganizationRepo: mockUserOrganizationRepo,
          transactionService: mockTransactionService,
          sendGridService: mockSendGridService,
          cognitoService: mockCognitoService,
          createData: registrationData,
          trackingContext:TEST_TRACKING_CONTEXT,
          trackingService: trackingServiceMock
        })
      ).rejects.toThrow('User already exists');

      expect(mockTransactionService.run).not.toHaveBeenCalled();
    });
  });

  describe('on transaction failure', () => {
    it('rolls back when organization creation fails', async () => {
      const dbError = new Error('Database constraint violation');
      mockCognitoService.createCognitoUser.mockResolvedValue(COGNITO_USER_ID);
      mockOrganizationRepo.create.mockRejectedValue(dbError);

      await expect(
        registerUser({
          userRepo: mockUserRepo,
          organizationRepo: mockOrganizationRepo,
          userOrganizationRepo: mockUserOrganizationRepo,
          transactionService: mockTransactionService,
          sendGridService: mockSendGridService,
          cognitoService: mockCognitoService,
          createData: registrationData,
          trackingContext:TEST_TRACKING_CONTEXT,
          trackingService: trackingServiceMock
        })
      ).rejects.toThrow('Database constraint violation');

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockUserOrganizationRepo.create).not.toHaveBeenCalled();
    });
  });
});
