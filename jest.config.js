/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.yarn/',
  ],
  coverageProvider: 'v8',
  coverageReporters: ['lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
  ],
  transform: {
    '^.+\\.tsx?$': 'jest-esbuild',
  },
  verbose: true,
};

module.exports = config;
