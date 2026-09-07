import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { integrationEnvironment } from './environment';

export const createWorkspace = (): Promise<string> => mkdtemp(join(tmpdir(), 'goreleaser-npm-publisher-'));

export const createSandbox = (name: string): Promise<string> =>
  mkdtemp(join(integrationEnvironment().workspacePath, `${name}-`));

export const removeWorkspace = (path: string): Promise<void> => rm(path, { recursive: true, force: true });
