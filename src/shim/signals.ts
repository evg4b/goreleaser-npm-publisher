import { type ChildProcess } from 'node:child_process';
import { constants } from 'node:os';
import process from 'node:process';
import { isWindows } from './helpers';

const SIGNALS: Record<string, number | undefined> = constants.signals;

const TRAPPED: NodeJS.Signals[] = ['SIGINT', 'SIGQUIT'];

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

export const relaySignals = (child: ChildProcess): void => {
  if (isWindows()) {
    return;
  }

  TRAPPED.forEach(signal => listen(signal, () => undefined));
  relayedSignals().forEach(signal => listen(signal, () => child.kill(signal)));
};

export const exitWithSignal = (signal: NodeJS.Signals): never => {
  process.removeAllListeners(signal);
  process.kill(process.pid, signal);

  return process.exit(128 + (SIGNALS[signal] ?? 0));
};

const relayedSignals = (): NodeJS.Signals[] => {
  const seen = new Set([...TRAPPED, ...UNTOUCHED].map(signal => SIGNALS[signal]));

  return (Object.keys(SIGNALS) as NodeJS.Signals[]).filter(signal => {
    const number = SIGNALS[signal];
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
    // the platform refuses to trap this signal
  }
};
