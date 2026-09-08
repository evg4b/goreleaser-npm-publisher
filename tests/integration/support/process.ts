import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { platform } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { npmEnvironment } from './environment';

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

const OUTPUT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 25;
const CLOSE_GRACE_MS = 500;

export interface ProcessExit {
  code: number | null;
  signal: NodeJS.Signals | null;
}

export interface StartOptions {
  ownProcessGroup?: boolean;
}

export interface RunningProcess {
  readonly output: () => string;
  readonly waitForOutput: (text: string) => Promise<void>;
  readonly kill: (signal: NodeJS.Signals) => void;
  readonly killGroup: (signal: NodeJS.Signals) => void;
  readonly exited: () => Promise<ProcessExit>;
}

export const startProcess = (
  command: string,
  args: string[],
  cwd: string,
  options: StartOptions = {},
): RunningProcess => {
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: options.ownProcessGroup ?? false,
  });

  let output = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => (output += chunk));
  child.stderr.on('data', (chunk: string) => (output += chunk));

  let finished = false;
  const exited = new Promise<ProcessExit>(resolve => {
    child.once('exit', (code, signal) => {
      finished = true;
      void Promise.race([once(child, 'close'), delay(CLOSE_GRACE_MS)]).then(() => resolve({ code, signal }));
    });
  });

  const waitForOutput = async (text: string): Promise<void> => {
    const deadline = Date.now() + OUTPUT_TIMEOUT_MS;
    while (!output.includes(text)) {
      if (finished) {
        throw new Error(`Process exited before "${text}" appeared. Output:\n${output}`);
      }

      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for "${text}". Output:\n${output}`);
      }

      await delay(POLL_INTERVAL_MS);
    }
  };

  return {
    output: () => output,
    waitForOutput,
    kill: signal => void child.kill(signal),
    killGroup: signal => {
      if (child.pid) {
        process.kill(-child.pid, signal);
      }
    },
    exited: () => exited,
  };
};

const npmCommand = isWindows ? 'npm.cmd' : 'npm';

export const runNpm = (args: string[], cwd: string): Promise<ExecResult> =>
  execOrFail(npmCommand, args, { cwd, env: npmEnvironment(), shell: isWindows });

const installedBinPath = (name: string, cwd: string): string =>
  join(cwd, 'node_modules', '.bin', isWindows ? `${name}.cmd` : name);

export const runInstalledBin = (name: string, args: string[], cwd: string): Promise<ExecResult> =>
  exec(installedBinPath(name, cwd), args, { cwd, shell: isWindows });
