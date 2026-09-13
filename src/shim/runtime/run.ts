import { canExecve, runWithExecve } from './execve';
import { runWithSpawn } from './spawn';

export const run = async (binary: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> => {
  if ((await canExecve(binary)) && runWithExecve(binary, args, env)) {
    return;
  }

  runWithSpawn(binary, args, env);
};
