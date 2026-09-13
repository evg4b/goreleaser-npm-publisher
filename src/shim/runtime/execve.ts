import { accessSync, constants } from 'node:fs';
import { execve } from 'node:process';

/** execve aborts the whole process when it fails, so the binary is checked before handing control over. */
export const canExecve = (binary: string): boolean => typeof execve === 'function' && isExecutable(binary);

export const runWithExecve = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  if (!execve) {
    throw new Error('process.execve is not available on this platform');
  }

  execve(binary, [binary, ...args], env);
};

const isExecutable = (binary: string): boolean => {
  try {
    accessSync(binary, constants.X_OK);

    return true;
  } catch {
    return false;
  }
};
