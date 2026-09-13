import { FakeChildProcess, mockChildProcess } from '@mocks/child_process';

import { spawn } from 'node:child_process';
import process from 'node:process';
import { runWithSpawn } from './spawn';

const spyOnExit = () => jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

describe('runWithSpawn', () => {
  const env = { PATH: '/usr/bin' };

  let child: FakeChildProcess;
  let exit: ReturnType<typeof spyOnExit>;

  beforeEach(() => {
    child = mockChildProcess();
    exit = spyOnExit();
  });

  afterEach(() => exit.mockRestore());

  it('spawns the binary with its arguments, inherited stdio and the given environment', () => {
    runWithSpawn('/bin/tool', ['--flag'], env);

    expect(spawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], { stdio: 'inherit', env });
  });

  it('propagates the exit code of the binary', () => {
    runWithSpawn('/bin/tool', [], env);

    child.emit('exit', 42, null);

    expect(exit).toHaveBeenCalledWith(42);
  });

  it('exits with 0 when the binary reports no exit code', () => {
    runWithSpawn('/bin/tool', [], env);

    child.emit('exit', null, null);

    expect(exit).toHaveBeenCalledWith(0);
  });

  it('reports a binary killed by a signal as 128 + the signal number', () => {
    runWithSpawn('/bin/tool', [], env);

    child.emit('exit', null, 'SIGINT');

    expect(exit).toHaveBeenCalledWith(130);
  });
});
