import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execPath } from 'node:process';
import type { ExecResult } from './exec';
import { runInstalledBin, runNpm } from './npm';
import { startProcess, type RunningProcess, type StartOptions } from './running-process';
import { createSandbox } from './workspace';

export interface NpmProject {
  readonly path: string;
  readonly install: (spec: string) => Promise<ExecResult>;
  readonly run: (bin: string, args?: string[]) => Promise<ExecResult>;
  readonly start: (name: string, args?: string[], options?: StartOptions) => Promise<RunningProcess>;
  readonly installedManifest: (name: string) => Promise<PackageJson | undefined>;
}

export const createNpmProject = async (name: string): Promise<NpmProject> => {
  const path = await createSandbox(name);
  const manifest = { name, version: '1.0.0', private: true, description: name, license: 'MIT' };
  await writeFile(join(path, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    path,
    install: spec => runNpm(['install', spec, '--loglevel', 'error'], path),
    run: (bin, args = []) => runInstalledBin(bin, args, path),
    start: (name, args = [], options = {}) => startInstalled(path, name, args, options),
    installedManifest: dependency => readManifest(join(path, 'node_modules', ...dependency.split('/'))),
  };
};

const startInstalled = async (
  path: string,
  name: string,
  args: string[],
  options: StartOptions,
): Promise<RunningProcess> => {
  const packagePath = join(path, 'node_modules', ...name.split('/'));
  const manifest = await readManifest(packagePath);
  const [entry] = Object.values(manifest?.bin ?? {});
  if (!entry) {
    throw new Error(`${name} is not installed, or declares no bin`);
  }

  return startProcess(execPath, [join(packagePath, entry), ...args], path, options);
};

const readManifest = async (packagePath: string): Promise<PackageJson | undefined> => {
  try {
    return JSON.parse(await readFile(join(packagePath, 'package.json'), 'utf8')) as PackageJson;
  } catch {
    return undefined;
  }
};
