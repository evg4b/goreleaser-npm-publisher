import { execve } from 'node:process';
import { isExecutable, isWindows } from './helpers';

export const canExecve = async (binary: string): Promise<boolean> =>
  !isWindows() && typeof execve === 'function' && (await isExecutable(binary));

export const runWithExecve = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  execve?.(binary, [binary, ...args], env);
};
