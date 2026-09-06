/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  clearMocks: true,
  cache: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  resolver: './tools/jest.resolver.cjs',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@helpers$': '<rootDir>/src/helpers',
    '^@npm$': '<rootDir>/src/npm',
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
