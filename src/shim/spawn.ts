import { spawn } from 'node:child_process';
import process from 'node:process';
import { fail } from './helpers';
import { exitWithSignal, relaySignals } from './signals';

export const runWithSpawn = (binary: string, args: string[], env: NodeJS.ProcessEnv): void => {
  const child = spawn(binary, args, { stdio: 'inherit', env });

  child.on('error', error => fail(`Failed to spawn ${binary}: ${error.message}`));
  child.on('exit', (code, signal) => (signal ? exitWithSignal(signal) : process.exit(code ?? 0)));
  relaySignals(child);
};
