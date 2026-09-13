import { access } from 'node:fs/promises';
import { execve } from 'node:process';

/** The value of fs.constants.X_OK, inlined: reading it from node:fs/promises would need node 18.4. */
const X_OK = 1;

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
    await access(binary, X_OK);

    return true;
  } catch {
    return false;
  }
};
