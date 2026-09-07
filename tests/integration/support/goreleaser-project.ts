import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { testAppPath } from './paths';
import { createSandbox } from './workspace';

export interface GoreleaserProject {
  readonly path: string;
  readonly packageName: string;
  readonly version: string;
  readonly builtPackages: () => Promise<string[]>;
  readonly builtManifest: (folder: string) => Promise<PackageJson>;
  readonly builtFile: (folder: string, ...parts: string[]) => Promise<string>;
  readonly addFile: (name: string, content: string) => Promise<void>;
}

export const createGoreleaserProject = async (packageName: string): Promise<GoreleaserProject> => {
  const path = await createSandbox(packageName);
  await cp(join(testAppPath, 'dist'), join(path, 'dist'), { recursive: true });
  const metadata = await readFile(join(testAppPath, 'dist', 'metadata.json'), 'utf8');

  const npmPath = join(path, 'dist', 'npm');

  return {
    path,
    packageName,
    version: (JSON.parse(metadata) as Metadata).version,
    builtPackages: async () => (await readdir(npmPath)).toSorted(),
    builtManifest: async folder =>
      JSON.parse(await readFile(join(npmPath, folder, 'package.json'), 'utf8')) as PackageJson,
    builtFile: (folder, ...parts) => readFile(join(npmPath, folder, ...parts), 'utf8'),
    addFile: (name, content) => writeFile(join(path, name), content, 'utf8'),
  };
};
