import { readFile } from 'node:fs/promises';

export const readJson = async <T = unknown>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8')) as T;
