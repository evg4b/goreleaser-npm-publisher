import { writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { httpJson } from './http';

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
