import { canExecve, runWithExecve } from './execve';
import { runWithSpawn } from './spawn';

export const run = (binary: string, args: string[], env: NodeJS.ProcessEnv): void =>
  canExecve(binary) ? runWithExecve(binary, args, env) : runWithSpawn(binary, args, env);
