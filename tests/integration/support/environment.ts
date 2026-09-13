import { join, resolve } from 'node:path';

export const repositoryRoot = resolve(__dirname, '..', '..', '..');
export const cliPath = join(repositoryRoot, 'dist', 'bin.cjs');
export const testAppPath = join(repositoryRoot, 'tests', 'test-app');

const REGISTRY_URL = 'INTEGRATION_REGISTRY_URL';
const NPMRC_PATH = 'INTEGRATION_NPMRC';
const NPM_CACHE_PATH = 'INTEGRATION_NPM_CACHE';
const WORKSPACE_PATH = 'INTEGRATION_WORKSPACE';

export interface IntegrationEnvironment {
  registryUrl: string;
  npmrcPath: string;
  npmCachePath: string;
  workspacePath: string;
}

export const exportEnvironment = (environment: IntegrationEnvironment): void => {
  process.env[REGISTRY_URL] = environment.registryUrl;
  process.env[NPMRC_PATH] = environment.npmrcPath;
  process.env[NPM_CACHE_PATH] = environment.npmCachePath;
  process.env[WORKSPACE_PATH] = environment.workspacePath;
};

export const integrationEnvironment = (): IntegrationEnvironment => ({
  registryUrl: required(REGISTRY_URL),
  npmrcPath: required(NPMRC_PATH),
  npmCachePath: required(NPM_CACHE_PATH),
  workspacePath: required(WORKSPACE_PATH),
});

export const npmEnvironment = (): NodeJS.ProcessEnv => {
  const { registryUrl, npmrcPath, npmCachePath } = integrationEnvironment();

  return {
    NPM_CONFIG_USERCONFIG: npmrcPath,
    NPM_CONFIG_REGISTRY: registryUrl,
    NPM_CONFIG_CACHE: npmCachePath,
    NPM_CONFIG_AUDIT: 'false',
    NPM_CONFIG_FUND: 'false',
    NPM_CONFIG_UPDATE_NOTIFIER: 'false',
  };
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Integration tests must run through jest.integration.config.js.`);
  }

  return value;
};
