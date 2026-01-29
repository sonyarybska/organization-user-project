import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  globalSetup: '<rootDir>/jest.global-setup.ts',
  globalTeardown: '<rootDir>/jest.global-teardown.ts',
  maxWorkers: 1,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json'
      }
    ]
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 120000
};

export default config;
