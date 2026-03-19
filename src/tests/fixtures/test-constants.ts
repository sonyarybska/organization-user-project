export const TEST_IDS = {
  COGNITO_1: 'cognito-sub-1',
  COGNITO_2: 'cognito-sub-2'
} as const;

export const TEST_TOKENS = {
  ACCESS: 'test-access-token-mock',
  REFRESH: 'test-refresh-token-mock',
  SIGNED_URL: 'https://signed-url.test.mock',
  INVITE_TOKEN: 'test-invite-token-mock'
} as const;

export const TEST_EMAILS = {
  VALID_USER: 'user@example.com',
  INVITED_USER: 'invite@example.com',
  ADMIN: 'admin@example.com'
} as const;

export const TEST_PASSWORDS = {
  VALID: 'SecurePass123!',
  WEAK: 'pass'
} as const;

export const TEST_USER_IDS = {
  FIRST: 'user-id-001',
  SECOND: 'user-id-002',
  ADMIN: 'admin-id-001'
} as const;

export const TEST_ORG_IDS = {
  FIRST: 'org-id-001',
  SECOND: 'org-id-002'
} as const;

export const TEST_ORG_NAMES = {
  TECH_CORP: 'TechCorp Inc',
  STARTUP: 'Cool Startup'
} as const;

export const TEST_COMPANY_DATA = {
  name: 'Acme Corporation',
  url: 'https://acme.example.com'
} as const;

export const TEST_DATES = {
  BIRTHDAY: new Date('1990-06-15'),
  PAST: new Date('2020-01-01'),
  FUTURE: new Date('2030-12-31')
} as const;

export const TEST_TRACKING_CONTEXT = {
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0'
} as const;
