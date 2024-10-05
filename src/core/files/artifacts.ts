import { readFile } from 'node:fs/promises';

export const parseArtifactsFile = (path: string): Promise<Artifact[]> => {
  return readFile(path, 'utf8').then(content => JSON.parse(content) as Artifact[]);
};
