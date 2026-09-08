import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { EOL } from 'node:os';
import { dirname, join } from 'node:path';
import { execPath } from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

export interface HttpResponse {
  ok: boolean;
  status: number;
  body: string;
}

export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export const httpRequest = async (url: string, options: HttpRequestOptions = {}): Promise<HttpResponse> => {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: { accept: 'application/json', ...options.headers },
    body: options.body,
  });

  return { ok: response.ok, status: response.status, body: await response.text() };
};

export const httpJson = async <T>(url: string, options: HttpRequestOptions = {}): Promise<T> => {
  const response = await httpRequest(url, options);
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} failed: ${response.status} ${response.body}`);
  }

  return JSON.parse(response.body) as T;
};

export interface RegistryUser {
  name: string;
  password: string;
  email: string;
}

export interface PackageManifest {
  name: string;
  version: string;
  bin?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  optionalDependencies?: Record<string, string>;
  dist: { tarball: string; shasum: string };
}

export interface Packument {
  name: string;
  'dist-tags': Record<string, string>;
  versions: Record<string, PackageManifest>;
}

export const createUser = async (registryUrl: string, user: RegistryUser): Promise<string> => {
  const { token } = await httpJson<{ token?: string }>(
    `${registryUrl}/-/user/org.couchdb.user:${encodeURIComponent(user.name)}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...user, type: 'user', roles: [], date: new Date().toISOString() }),
    },
  );

  if (!token) {
    throw new Error(`Registry did not return a token for user ${user.name}`);
  }

  return token;
};

export const writeNpmrc = (path: string, registryUrl: string, token: string): Promise<void> => {
  const authority = registryUrl.replace(/^https?:/, '');

  return writeFile(path, [`registry=${registryUrl}`, `${authority}/:_authToken=${token}`, ''].join(EOL), 'utf8');
};

export const getPackument = (registryUrl: string, name: string): Promise<Packument> =>
  httpJson<Packument>(`${registryUrl}/${packagePath(name)}`);

export const getManifest = (registryUrl: string, name: string, version: string): Promise<PackageManifest> =>
  httpJson<PackageManifest>(`${registryUrl}/${packagePath(name)}/${encodeURIComponent(version)}`);

const packagePath = (name: string): string => name.replaceAll('/', '%2f');

const READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 250;
const STOP_TIMEOUT_MS = 10_000;

const verdaccioBinPath = join(dirname(require.resolve('verdaccio/package.json')), 'bin', 'verdaccio');

export interface VerdaccioServer {
  readonly url: string;
  readonly stop: () => Promise<void>;
}

export const startVerdaccio = async (root: string): Promise<VerdaccioServer> => {
  const configPath = await writeConfig(root);
  const url = `http://127.0.0.1:${await freePort()}`;

  const server = spawn(execPath, [verdaccioBinPath, '--config', configPath, '--listen', url], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const log = collectLog(server);
  try {
    await waitForReady(url, server, log);
  } catch (error) {
    await stop(server);
    throw error;
  }

  return { url, stop: () => stop(server) };
};

const writeConfig = async (root: string): Promise<string> => {
  await mkdir(join(root, 'storage'), { recursive: true });
  const configPath = join(root, 'verdaccio.yaml');
  await writeFile(configPath, config(root), 'utf8');

  return configPath;
};

const config = (root: string): string => `
storage: ${JSON.stringify(join(root, 'storage'))}
auth:
  htpasswd:
    file: ${JSON.stringify(join(root, 'htpasswd'))}
    algorithm: bcrypt
    max_users: 10
uplinks: {}
packages:
  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
publish:
  allow_offline: true
log:
  type: stdout
  format: pretty
  level: warn
`;

const collectLog = (server: ChildProcess): (() => string) => {
  let log = '';
  const append = (chunk: Buffer) => (log += chunk.toString('utf8'));

  server.stdout?.on('data', append);
  server.stderr?.on('data', append);

  return () => log.trim();
};

const waitForReady = async (url: string, server: ChildProcess, log: () => string): Promise<void> => {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (hasExited(server)) {
      throw new Error(`Verdaccio exited before it became ready:\n${log()}`);
    }

    if (await ping(url)) {
      return;
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Verdaccio did not become ready within ${READY_TIMEOUT_MS}ms:\n${log()}`);
};

const ping = async (url: string): Promise<boolean> => {
  try {
    return (await httpRequest(`${url}/-/ping`)).ok;
  } catch {
    return false;
  }
};

const stop = async (server: ChildProcess): Promise<void> => {
  if (hasExited(server)) {
    return;
  }

  const exited = new Promise<void>(resolve => server.once('exit', () => resolve()));
  server.kill();
  const forceKill = setTimeout(() => server.kill('SIGKILL'), STOP_TIMEOUT_MS);
  try {
    await exited;
  } finally {
    clearTimeout(forceKill);
  }
};

const hasExited = (server: ChildProcess): boolean => server.exitCode !== null || server.signalCode !== null;

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      if (address === null || typeof address === 'string') {
        probe.close(() => reject(new Error('Could not resolve a free port for the registry')));
        return;
      }

      probe.close(() => resolve(address.port));
    });
  });
