import { spawn, type ChildProcess } from 'node:child_process';
import { constants } from 'node:os';
import process from 'node:process';
import { fail, isExecutable, isWindows } from './helpers';

const IGNORED: NodeJS.Signals[] = ['SIGINT', 'SIGQUIT'];
const RELAYED: NodeJS.Signals[] = ['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'];

export const run = async (binary: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> => {
  if (await canExecve(binary)) {
    process.execve?.(binary, [binary, ...args], env);
  } else {
    runWithSpawn(binary, args, env);
  }
};

const canExecve = async (binary: string): Promise<boolean> =>
  !isWindows() && typeof process.execve === 'function' && (await isExecutable(binary));

const runWithSpawn = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  const child = spawn(binary, args, { stdio: 'inherit', env });

  child.on('error', error => fail(`Failed to spawn ${binary}: ${error.message}`));
  child.on('exit', (code, signal) => (signal ? exitWithSignal(signal) : process.exit(code ?? 0)));
  relaySignals(child);
};

const relaySignals = (child: ChildProcess): void => {
  if (isWindows()) {
    return;
  }

  IGNORED.forEach(signal => process.on(signal, () => undefined));
  RELAYED.forEach(signal => process.on(signal, () => child.kill(signal)));
};

const exitWithSignal = (signal: NodeJS.Signals): never => {
  process.removeAllListeners(signal);
  process.kill(process.pid, signal);

  return process.exit(128 + constants.signals[signal]);
};
