import { writeFile } from 'node:fs/promises';

export const writePackage = async (path: string, config: PackageJson) => {
  await writeFile(path, JSON.stringify(config, null, 2));
};
