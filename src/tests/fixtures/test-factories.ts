import { User } from 'src/types/User';
import { Organization } from 'src/types/Organization';
import { Prospect } from 'src/types/Prospect';
import { OrganizationInvite } from 'src/types/OrganizationInvite';
import { Attachment } from 'src/types/Attachment';
import { UserOrganization } from 'src/types/UserOrganization';
import { Company } from 'src/types/Company';
import { CsvImportRecord } from 'src/types/CsvImportRecord';
import { UserRoleEnum } from 'src/types/enums/UserRoleEnum';
import { SourceTypeEnum } from 'src/types/enums/SourceTypeEnum';
import { InviteStatus } from 'src/types/enums/InviteStatusEnum';
import { CsvImportStatusEnum } from 'src/types/enums/CsvImportStatusEnum';
import { v4 as uuid } from 'uuid';

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: uuid(),
    cognitoUserId: 'cognito-1',
    name: 'Test User',
    email: 'user1@test.com',
    companyName: 'Test Company',
    companyUrl: 'https://test.com',
    birthday: new Date('1990-01-01'),
    userOrganizations: [],
    avatarId: uuid(),
    avatar: createTestAttachment(),
    ...overrides
  };
}

export function createTestOrganization(overrides: Partial<Organization> = {}): Organization {
  return {
    id: uuid(),
    name: 'Test Organization',
    ...overrides
  };
}

export function createTestProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: uuid(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    domain: 'test.com',
    phone: null,
    salary: null,
    department: null,
    linkedinUrl: null,
    title: null,
    userId: uuid(),
    organizationId: uuid(),
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
    companyId: null,
    source: SourceTypeEnum.MANUAL,
    ...overrides
  };
}

export function createTestInvite(overrides: Partial<OrganizationInvite> = {}): OrganizationInvite {
  return {
    id: uuid(),
    email: 'invite@test.com',
    organizationId: uuid(),
    token: 'test-token-123',
    status: InviteStatus.PENDING,
    expiresAt: new Date('2026-12-31'),
    createdAt: new Date('2026-01-20'),
    ...overrides
  };
}

export function createTestAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: uuid(),
    originalName: 'test-file.txt',
    key: 'public/attachments/user-1/test-file.txt',
    publicKey: 'attachments/user-1/test-file.txt',
    userId: uuid(),
    ...overrides
  };
}

export function createTestUserOrganization(overrides: Partial<UserOrganization> = {}): UserOrganization {
  return {
    id: uuid(),
    userId: uuid(),
    organizationId: uuid(),
    role: UserRoleEnum.USER,
    ...overrides
  };
}

export function createTestCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: uuid(),
    name: 'Test Company',
    domain: 'testcompany.com',
    source: SourceTypeEnum.MANUAL,
    organizationId: uuid(),
    linkedinUrl: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createTestCsvImportRecord(overrides: Partial<CsvImportRecord> = {}): CsvImportRecord {
  return {
    id: uuid(),
    key: 'csv-imports/org-1/user-1/test.csv',
    organizationId: uuid(),
    userId: uuid(),
    status: CsvImportStatusEnum.NEW,
    totalRows: 10,
    processedRows: 0,
    failedRows: 0,
    lastError: null,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
    ...overrides
  };
}

