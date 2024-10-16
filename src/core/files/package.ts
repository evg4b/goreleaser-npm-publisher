import { writeFile } from '../../helpers/fs';

export const writePackage = async (path: string, config: PackageJson) => {
  await writeFile(path, JSON.stringify(config, null, 2));
};
