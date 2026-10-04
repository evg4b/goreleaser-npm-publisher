import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { platform } from 'node:os';
import process from 'node:process';

export const isWindows = (): boolean => platform() === 'win32';

export const isExecutable = (path: string): Promise<boolean> =>
  access(path, constants.X_OK).then(
    () => true,
    () => false,
  );

export const fail = (message: string): never => {
  console.error(message);

  return process.exit(1);
};
