import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execPath } from 'node:process';
import { cliPath, integrationEnvironment, npmEnvironment, repositoryRoot, testAppPath } from './environment';
import {
  exec,
  runInstalledBin,
  runNpm,
  startProcess,
  type ExecResult,
  type RunningProcess,
  type StartOptions,
} from './process';

export const readJson = async <T = unknown>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T;

export const createWorkspace = (): Promise<string> => mkdtemp(join(tmpdir(), 'goreleaser-npm-publisher-'));

export const removeWorkspace = (path: string): Promise<void> => rm(path, { recursive: true, force: true });

export const createSandbox = (name: string): Promise<string> =>
  mkdtemp(join(integrationEnvironment().workspacePath, `${name}-`));

export const runCli = (args: string[]): Promise<ExecResult> =>
  exec(execPath, [cliPath, ...args], { cwd: repositoryRoot, env: npmEnvironment() });

export interface GoreleaserProject {
  readonly path: string;
  readonly packageName: string;
  readonly version: string;
  readonly build: (args?: string[]) => Promise<ExecResult>;
  readonly publish: (args?: string[]) => Promise<ExecResult>;
  readonly list: (args?: string[]) => Promise<ExecResult>;
  readonly packages: () => Promise<string[]>;
  readonly manifest: (folder: string) => Promise<PackageJson>;
  readonly file: (folder: string, ...parts: string[]) => Promise<string>;
  readonly addFile: (name: string, content: string) => Promise<void>;
}

export const createProject = async (packageName: string): Promise<GoreleaserProject> => {
  const path = await createSandbox(packageName);
  await cp(join(testAppPath, 'dist'), join(path, 'dist'), { recursive: true });
  const { version } = await readJson<Metadata>(join(testAppPath, 'dist', 'metadata.json'));
  const npmPath = join(path, 'dist', 'npm');
  const command = (name: string, args: string[]) => runCli([name, '--project', path, '--name', packageName, ...args]);

  return {
    path,
    packageName,
    version,
    build: (args = []) => command('build', args),
    publish: (args = []) => command('publish', args),
    list: (args = []) => runCli(['list', '--project', path, ...args]),
    packages: () => readdir(npmPath).then(folders => folders.toSorted()),
    manifest: folder => readJson<PackageJson>(join(npmPath, folder, 'package.json')),
    file: (folder, ...parts) => readFile(join(npmPath, folder, ...parts), 'utf8'),
    addFile: (name, content) => writeFile(join(path, name), content, 'utf8'),
  };
};

export interface NpmProject {
  readonly path: string;
  readonly install: (spec: string) => Promise<ExecResult>;
  readonly run: (bin: string, args?: string[]) => Promise<ExecResult>;
  readonly start: (name: string, args?: string[], options?: StartOptions) => Promise<RunningProcess>;
  readonly manifest: (name: string) => Promise<PackageJson | undefined>;
}

export const createConsumer = async (name: string): Promise<NpmProject> => {
  const path = await createSandbox(name);
  const manifest = { name, version: '1.0.0', private: true, description: name, license: 'MIT' };
  await writeFile(join(path, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    path,
    install: spec => runNpm(['install', spec, '--loglevel', 'error'], path),
    run: (bin, args = []) => runInstalledBin(bin, args, path),
    start: (dependency, args = [], options = {}) => startInstalled(path, dependency, args, options),
    manifest: dependency => installedManifest(join(path, 'node_modules', ...dependency.split('/'))),
  };
};

const startInstalled = async (
  path: string,
  name: string,
  args: string[],
  options: StartOptions,
): Promise<RunningProcess> => {
  const packagePath = join(path, 'node_modules', ...name.split('/'));
  const manifest = await installedManifest(packagePath);
  const [entry] = Object.values(manifest?.bin ?? {});
  if (!entry) {
    throw new Error(`${name} is not installed, or declares no bin`);
  }

  return startProcess(execPath, [join(packagePath, entry), ...args], path, options);
};

const installedManifest = async (packagePath: string): Promise<PackageJson | undefined> => {
  try {
    return await readJson<PackageJson>(join(packagePath, 'package.json'));
  } catch {
    return undefined;
  }
};
