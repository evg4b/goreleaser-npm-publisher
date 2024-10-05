import { readFile } from 'node:fs/promises';

export const parseMetadata = (path: string): Promise<Metadata> => {
  return readFile(path, 'utf-8').then(content => JSON.parse(content) as Metadata);
};
