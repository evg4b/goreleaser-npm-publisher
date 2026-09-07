import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

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
