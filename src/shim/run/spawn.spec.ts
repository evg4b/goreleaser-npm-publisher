import '@mocks/os';
import { FakeChildProcess, mockChildProcess } from '@mocks/child_process';

import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import process from 'node:process';
import { runWithSpawn } from './spawn';

const spyOnExit = () => jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

describe('runWithSpawn', () => {
  const env = { PATH: '/usr/bin' };

  let child: FakeChildProcess;
  let exit: ReturnType<typeof spyOnExit>;
  let on: ReturnType<typeof spyOnOn>;

  beforeEach(() => {
    child = mockChildProcess();
    exit = spyOnExit();
    on = spyOnOn();
  });

  afterEach(() => {
    exit.mockRestore();
    on.mockRestore();
  });

  const run = (): void => runWithSpawn('/bin/tool', [], env);

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

    child.emit('exit', 42, null);

    expect(exit).toHaveBeenCalledWith(42);
  });

  it('exits with 0 when the binary reports no exit code', () => {
    run();

    child.emit('exit', null, null);

    expect(exit).toHaveBeenCalledWith(0);
  });

  it('reports a binary killed by a signal as 128 + the signal number', () => {
    run();

    child.emit('exit', null, 'SIGINT');

    expect(exit).toHaveBeenCalledWith(130);
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

  it('traps no signals on windows, where the shim cannot relay them', () => {
    jest.mocked(platform).mockReturnValue('win32');

    run();

    expect(on).not.toHaveBeenCalled();
  });
});
