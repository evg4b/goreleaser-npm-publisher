import { execve } from 'node:process';

export const isExecveSupported = (): boolean => typeof execve === 'function';

export const runWithExecve = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  if (!execve) {
    throw new Error('process.execve is not available on this platform');
  }

  execve(binary, [binary, ...args], env);
};
