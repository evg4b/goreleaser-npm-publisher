import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readJson } from './json';
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
  const { version } = await readJson<Metadata>(join(testAppPath, 'dist', 'metadata.json'));
  const npmPath = join(path, 'dist', 'npm');

  return {
    path,
    packageName,
    version,
    builtPackages: () => readdir(npmPath).then(folders => folders.toSorted()),
    builtManifest: folder => readJson<PackageJson>(join(npmPath, folder, 'package.json')),
    builtFile: (folder, ...parts) => readFile(join(npmPath, folder, ...parts), 'utf8'),
    addFile: (name, content) => writeFile(join(path, name), content, 'utf8'),
  };
};
