const isWindows = process.platform === 'win32';

export default {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
  moduleNameMapper: {
    '^@integration/(.*)$': '<rootDir>/tests/integration/$1',
  },
  globalSetup: '<rootDir>/tests/integration/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/setup/global-teardown.ts',
  testTimeout: isWindows ? 240_000 : 60_000,
  maxWorkers: isWindows ? 2 : 5,
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
  },
};
