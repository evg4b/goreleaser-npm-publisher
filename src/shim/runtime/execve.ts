import { access } from 'node:fs/promises';
import { platform } from 'node:os';
import { execve } from 'node:process';

/** The value of fs.constants.X_OK, inlined: reading it from node:fs/promises would need node 18.4. */
const X_OK = 1;

/**
 * Windows defines process.execve and refuses to perform it, so the platform is checked too, and execve aborts the
 * whole process when it fails, so the binary is checked before handing control over.
 */
export const canExecve = async (binary: string): Promise<boolean> =>
  platform() !== 'win32' && typeof execve === 'function' && (await isExecutable(binary));

/** Only returns when the handover did not happen: on success the process has already become the binary. */
export const runWithExecve = (binary: string, args: string[], env: NodeJS.ProcessEnv): boolean => {
  if (!execve) {
    return false;
  }

  try {
    execve(binary, [binary, ...args], env);

    return true;
  } catch {
    return false;
  }
};

const isExecutable = async (binary: string): Promise<boolean> => {
  try {
    await access(binary, X_OK);

    return true;
  } catch {
    return false;
  }
};
