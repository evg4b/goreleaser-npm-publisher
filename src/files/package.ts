import { writeFile } from 'node:fs/promises';

interface PackageJson {
    name: string;
    version: string;
    bin: string;
}

export const writePackage = async (path: string, config: PackageJson) => {
    await writeFile(path, JSON.stringify(config, null, 2));
};
