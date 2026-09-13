import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { cwd } from 'node:process';
import { execInContext } from './context';
import { NpmExecError } from './error';
import { type ErrorResponse, type NpmExecContext } from './models';

export const npmExec = async <T>(args: string[], options?: NpmExecContext): Promise<T> => {
  const isWindows = platform() === 'win32';
  const context = options ?? {};
  const command = ['--json', ...args];

  return execInContext<T>(
    context,
    env =>
      new Promise((resolve, reject) => {
        const spawnOptions = { cwd: options?.pwd ?? cwd(), env: env };
        const npmProcess = isWindows
          ? spawn(commandLine('npm.cmd', command), { ...spawnOptions, shell: true })
          : spawn('npm', command, spawnOptions); // NOSONAR: the publisher runs the user's own npm

        let stdout = '';
        let stderr = '';
        npmProcess.stdout.on('data', (data: string) => (stdout += data));
        npmProcess.stderr.on('data', (data: string) => (stderr += data));
        npmProcess.on('close', code => {
          if (code) {
            const errorResp = JSON.parse(stdout) as ErrorResponse;
            reject(new NpmExecError(errorResp.error));
          }

          resolve(JSON.parse(stdout) as T);
        });
        npmProcess.on('error', err => reject(err));
      }),
  );
};

const commandLine = (bin: string, args: string[]): string => [bin, ...args.map(quoteArg)].join(' ');

const quoteArg = (arg: string): string => (/[\s"]/.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg);
