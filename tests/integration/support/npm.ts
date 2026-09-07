import { join } from 'node:path';
import { npmEnvironment } from './environment';
import { exec, execOrFail, isWindows, type ExecResult } from './exec';

const npmCommand = isWindows ? 'npm.cmd' : 'npm';

export const runNpm = (args: string[], cwd: string): Promise<ExecResult> =>
  execOrFail(npmCommand, args, { cwd, env: npmEnvironment(), shell: isWindows });

const installedBinPath = (name: string, cwd: string): string =>
  join(cwd, 'node_modules', '.bin', isWindows ? `${name}.cmd` : name);

export const runInstalledBin = (name: string, args: string[], cwd: string): Promise<ExecResult> =>
  exec(installedBinPath(name, cwd), args, { cwd, shell: isWindows });
