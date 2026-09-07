import { spawn } from 'node:child_process';
import { platform } from 'node:os';

export const isWindows = platform() === 'win32';

export interface ExecOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  shell?: boolean;
}

export interface ExecResult {
  command: string;
  code: number | null;
  stdout: string;
  stderr: string;
}

export const exec = (command: string, args: string[], options: ExecOptions): Promise<ExecResult> =>
  new Promise((resolve, reject) => {
    const spawnOptions = { cwd: options.cwd, env: { ...cleanEnv(), ...options.env } };
    const child = options.shell
      ? spawn(commandLine(command, args), { ...spawnOptions, shell: true })
      : spawn(command, args, spawnOptions);

    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => (stdout += chunk));
    child.stderr.on('data', (chunk: string) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', code => resolve({ command: [command, ...args].join(' '), code, stdout, stderr }));
  });

export const execOrFail = async (command: string, args: string[], options: ExecOptions): Promise<ExecResult> => {
  const result = await exec(command, args, options);
  if (result.code !== 0) {
    throw new Error(formatFailure(result));
  }

  return result;
};

export const output = (result: ExecResult): string => `${result.stdout}${result.stderr}`;

const formatFailure = (result: ExecResult): string =>
  [`Command failed (exit code ${result.code ?? 'null'}): ${result.command}`, result.stdout, result.stderr]
    .filter(part => part.trim().length > 0)
    .join('\n');

const commandLine = (command: string, args: string[]): string => [command, ...args].map(quote).join(' ');

const quote = (value: string): string => (/[\s"]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value);

const cleanEnv = (): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.toLowerCase().startsWith('npm_config_')));
