import { access, constants } from 'node:fs/promises';
import { execve } from 'node:process';

/** execve aborts the whole process when it fails, so the binary is checked before handing control over. */
export const canExecve = async (binary: string): Promise<boolean> =>
  typeof execve === 'function' && (await isExecutable(binary));

export const runWithExecve = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  if (!execve) {
    throw new Error('process.execve is not available on this platform');
  }

  execve(binary, [binary, ...args], env);
};

const isExecutable = async (binary: string): Promise<boolean> => {
  try {
    await access(binary, constants.X_OK);

    return true;
  } catch {
    return false;
  }
};
