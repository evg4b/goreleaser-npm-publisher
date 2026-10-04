jest.mock('./helpers', () => ({
  fail: jest.fn().mockName('fail'),
}));

jest.mock('./signals', () => ({
  exitWithSignal: jest.fn().mockName('exitWithSignal'),
  relaySignals: jest.fn().mockName('relaySignals'),
}));

import { FakeChildProcess, mockChildProcess } from '@mocks/child_process';
import { mockExit, ProcessExited } from '@mocks/exit';

import { spawn } from 'node:child_process';
import { fail } from './helpers';
import { exitWithSignal, relaySignals } from './signals';
import { runWithSpawn } from './spawn';

describe('runWithSpawn', () => {
  const env = { PATH: '/usr/bin' };

  let child: FakeChildProcess;
  let exit: ReturnType<typeof mockExit>;

  beforeEach(() => {
    child = mockChildProcess();
    exit = mockExit();
  });

  it('spawns the binary with its arguments, inherited stdio and the given environment', () => {
    runWithSpawn('/bin/tool', ['--flag'], env);

    expect(spawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], { stdio: 'inherit', env });
  });

  it('relays signals to the binary', () => {
    runWithSpawn('/bin/tool', [], env);

    expect(relaySignals).toHaveBeenCalledWith(child);
  });

  it('exits with the exit code of the binary', () => {
    runWithSpawn('/bin/tool', [], env);

    expect(() => child.emit('exit', 42, null)).toThrow(ProcessExited);
    expect(exit).toHaveBeenCalledWith(42);
  });

  it('exits with 0 when the binary reports no exit code', () => {
    runWithSpawn('/bin/tool', [], env);

    expect(() => child.emit('exit', null, null)).toThrow(ProcessExited);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('exits with the signal that killed the binary', () => {
    runWithSpawn('/bin/tool', [], env);

    child.emit('exit', null, 'SIGTERM');

    expect(exitWithSignal).toHaveBeenCalledWith('SIGTERM');
    expect(exit).not.toHaveBeenCalled();
  });

  it('reports a binary that cannot be started', () => {
    runWithSpawn('/bin/tool', [], env);

    child.emit('error', new Error('spawn EACCES'));

    expect(fail).toHaveBeenCalledWith('Failed to spawn /bin/tool: spawn EACCES');
  });
});
