import { spawn, type ChildProcess } from 'node:child_process';
import { constants, platform } from 'node:os';
import process from 'node:process';
import { fail } from './fail';

/** Sent to the whole process group by the terminal: the binary has them already, and the shim must outlive it. */
const TRAPPED: NodeJS.Signals[] = ['SIGINT', 'SIGQUIT'];

/**
 * Left to node: job control and terminal signals reach the process group on their own, the ones that are ignored by
 * default change nothing for the binary either, and the rest cannot be trapped or are needed by node itself.
 */
const UNTOUCHED: NodeJS.Signals[] = [
  'SIGKILL',
  'SIGSTOP',
  'SIGCHLD',
  'SIGPROF',
  'SIGSEGV',
  'SIGBUS',
  'SIGILL',
  'SIGFPE',
  'SIGPIPE',
  'SIGTSTP',
  'SIGTTIN',
  'SIGTTOU',
  'SIGWINCH',
  'SIGCONT',
  'SIGURG',
  'SIGIO',
];

export const runWithSpawn = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  const child = spawn(binary, args, { stdio: 'inherit', env });

  child.on('error', error => fail(`Failed to spawn ${binary}: ${error.message}`));
  trapSignals(child);
  child.on('exit', (code, signal) => (signal ? dieBy(signal) : process.exit(code ?? 0)));
};

const trapSignals = (child: ChildProcess): void => {
  if (platform() === 'win32') {
    return;
  }

  TRAPPED.forEach(signal => listen(signal, ignore));
  relayedSignals().forEach(signal => listen(signal, () => child.kill(signal)));
};

/** Every signal the platform knows and the shim may trap, aliases such as SIGABRT and SIGIOT counted once. */
const relayedSignals = (): NodeJS.Signals[] => {
  const seen = new Set([...TRAPPED, ...UNTOUCHED].map(signal => constants.signals[signal]));

  return (Object.keys(constants.signals) as NodeJS.Signals[]).filter(signal => {
    const number = constants.signals[signal];
    if (seen.has(number)) {
      return false;
    }

    seen.add(number);

    return true;
  });
};

const listen = (signal: NodeJS.Signals, handler: () => void): void => {
  try {
    process.on(signal, handler);
  } catch {
    // The platform knows the signal but refuses to trap it.
  }
};

const ignore = (): void => undefined;

/** Under execve the binary owns the process, so the shim leaves the same wait status behind: killed by the signal. */
const dieBy = (signal: NodeJS.Signals): never => {
  process.removeAllListeners(signal);
  process.kill(process.pid, signal);

  return process.exit(128 + constants.signals[signal]);
};
