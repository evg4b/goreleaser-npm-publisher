import { execPath } from 'node:process';
import { npmEnvironment } from './environment';
import { exec, type ExecResult } from './exec';
import type { GoreleaserProject } from './goreleaser-project';
import { cliPath, repositoryRoot } from './paths';

export const runPublisher = (args: string[]): Promise<ExecResult> =>
  exec(execPath, [cliPath, ...args], { cwd: repositoryRoot, env: npmEnvironment() });

export const publishProject = (project: GoreleaserProject, args: string[] = []): Promise<ExecResult> =>
  runPublisher(['publish', '--project', project.path, '--name', project.packageName, ...args]);

export const buildProject = (project: GoreleaserProject, args: string[] = []): Promise<ExecResult> =>
  runPublisher(['build', '--project', project.path, '--name', project.packageName, ...args]);

export const listProject = (project: GoreleaserProject, args: string[] = []): Promise<ExecResult> =>
  runPublisher(['list', '--project', project.path, ...args]);
