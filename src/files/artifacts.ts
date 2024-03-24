import { readFile } from 'node:fs/promises';

export const parseArtifactsFile = async (path: string): Promise<Artifact[]> => {
    const artifactsFile = await readFile(path, 'utf8');
    return (JSON.parse(artifactsFile) as Artifact[] | undefined) ?? [];
};
