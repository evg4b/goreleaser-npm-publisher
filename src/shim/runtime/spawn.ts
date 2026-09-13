import { spawn, type ChildProcess } from 'node:child_process';
import { constants, platform } from 'node:os';
import process from 'node:process';
import { fail } from './fail';

/** Sent to the whole process group by the terminal, so the binary already got them. */
const GROUP_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGQUIT'];

/** Sent to the shim alone, so the binary only sees them when the shim relays them. */
const RELAYED_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'];

export const runWithSpawn = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  const child = spawn(binary, args, { stdio: 'inherit', env });

  child.on('error', error => fail(`Failed to spawn ${binary}: ${error.message}`));
  trapSignals(child);
  child.on('exit', (code, signal) => process.exit(exitCode(code, signal)));
};

const trapSignals = (child: ChildProcess): void => {
  if (platform() === 'win32') {
    return;
  }

  GROUP_SIGNALS.forEach(signal => process.on(signal, ignore));
  RELAYED_SIGNALS.forEach(signal => process.on(signal, () => child.kill(signal)));
};

const ignore = (): void => undefined;

const exitCode = (code: number | null, signal: NodeJS.Signals | null): number =>
  signal ? 128 + constants.signals[signal] : (code ?? 0);
