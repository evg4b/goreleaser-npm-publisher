import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

export const parseConfigFile = async (path: string): Promise<GoReleaserConfiguration> => {
    const configFile = await readFile(path, 'utf8');
    return parse(configFile) as GoReleaserConfiguration;
};
