import { isExecveSupported, runWithExecve } from './execve';
import { runWithSpawn } from './spawn';

export const run = (binary: string, args: string[], env: NodeJS.ProcessEnv): void =>
  isExecveSupported() ? runWithExecve(binary, args, env) : runWithSpawn(binary, args, env);
