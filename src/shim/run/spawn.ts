import { spawn } from 'node:child_process';
import { constants } from 'node:os';
import process from 'node:process';

export const runWithSpawn = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  const child = spawn(binary, args, { stdio: 'inherit', env });

  child.on('exit', (code, signal) => process.exit(exitCode(code, signal)));
};

const exitCode = (code: number | null, signal: NodeJS.Signals | null): number =>
  signal ? 128 + constants.signals[signal] : (code ?? 0);
