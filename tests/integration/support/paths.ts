import { join, resolve } from 'node:path';

export const repositoryRoot = resolve(__dirname, '..', '..', '..');

export const cliPath = join(repositoryRoot, 'dist', 'bin.cjs');

export const testAppPath = join(repositoryRoot, 'tests', 'test-app');
