/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  clearMocks: true,
  cache: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  resolver: './tools/jest.resolver.cjs',
  // Integration tests have their own config: they need a built CLI and a registry.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/integration/'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@helpers$': '<rootDir>/src/helpers',
    '^@npm$': '<rootDir>/src/npm',
    '^@npm/(.*)$': '<rootDir>/src/npm/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',
    '^@shim$': '<rootDir>/src/shim',
    '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/.yarn/'],
  coverageProvider: 'v8',
  coverageReporters: ['lcov'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts', '!src/**/models.ts'],
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
