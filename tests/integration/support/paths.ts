import { dirname, join, resolve } from 'node:path';

export const repositoryRoot = resolve(__dirname, '..', '..', '..');

export const cliPath = join(repositoryRoot, 'dist', 'bin.cjs');

export const testAppPath = join(repositoryRoot, 'tests', 'test-app');

export const verdaccioBinPath = join(dirname(require.resolve('verdaccio/package.json')), 'bin', 'verdaccio');
