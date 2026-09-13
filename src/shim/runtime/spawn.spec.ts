jest.mock('./fail', () => ({
  fail: jest.fn().mockName('fail'),
}));

import '@mocks/os';
import { FakeChildProcess, mockChildProcess } from '@mocks/child_process';
import { mockExit, ProcessExited } from '@mocks/exit';

import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import process from 'node:process';
import { fail } from './fail';
import { runWithSpawn } from './spawn';

const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

describe('runWithSpawn', () => {
  const env = { PATH: '/usr/bin' };

  let child: FakeChildProcess;
  let on: ReturnType<typeof spyOnOn>;

  beforeEach(() => {
    child = mockChildProcess();
    mockExit();
    on = spyOnOn();
  });

  afterEach(() => on.mockRestore());

  const run = (): void => runWithSpawn('/bin/tool', [], env);

  const exitWith = (code: number | null, signal: NodeJS.Signals | null): number => {
    try {
      child.emit('exit', code, signal);
    } catch (error) {
      if (error instanceof ProcessExited) {
        return error.code;
      }

      throw error;
    }

    throw new Error('The shim kept running after the binary exited');
  };

  const raise = (signal: NodeJS.Signals): void => {
    const handler = on.mock.calls.find(([event]) => event === signal)?.[1];
    if (!handler) {
      throw new Error(`No handler registered for ${signal}`);
    }

    handler(signal);
  };

  it('spawns the binary with its arguments, inherited stdio and the given environment', () => {
    runWithSpawn('/bin/tool', ['--flag'], env);

    expect(spawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], { stdio: 'inherit', env });
  });

  it('propagates the exit code of the binary', () => {
    run();

    expect(exitWith(42, null)).toBe(42);
  });

  it('exits with 0 when the binary reports no exit code', () => {
    run();

    expect(exitWith(null, null)).toBe(0);
  });

  it('reports a binary killed by a signal as 128 + the signal number', () => {
    run();

    expect(exitWith(null, 'SIGINT')).toBe(130);
  });

  it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'])('relays %s to the binary', signal => {
    run();

    raise(signal);

    expect(child.kill).toHaveBeenCalledWith(signal);
  });

  it.each<NodeJS.Signals>(['SIGINT', 'SIGQUIT'])('traps %s without passing it on', signal => {
    run();

    raise(signal);

    expect(child.kill).not.toHaveBeenCalled();
  });

  it('reports a binary that cannot be started', () => {
    run();

    child.emit('error', new Error('spawn EACCES'));

    expect(fail).toHaveBeenCalledWith('Failed to spawn /bin/tool: spawn EACCES');
  });

  it('traps no signals on windows, where the shim cannot relay them', () => {
    jest.mocked(platform).mockReturnValue('win32');

    run();

    expect(on).not.toHaveBeenCalled();
  });
});
