import { readFile } from 'node:fs/promises';

export const parseMetadata = async (path: string): Promise<Metadata> => {
  const metadataFile = await readFile(path, 'utf-8');
  return JSON.parse(metadataFile) as Metadata;
};
