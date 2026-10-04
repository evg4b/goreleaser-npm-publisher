jest.mock('./helpers', () => ({
  isWindows: jest.fn().mockName('isWindows').mockReturnValue(false),
}));

import { FakeChildProcess } from '@mocks/child_process';
import { mockExit, ProcessExited } from '@mocks/exit';

import { type ChildProcess } from 'node:child_process';
import process from 'node:process';
import { isWindows } from './helpers';
import { exitWithSignal, relaySignals } from './signals';

const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

describe('relaySignals', () => {
  let child: FakeChildProcess;
  let on: ReturnType<typeof spyOnOn>;

  beforeEach(() => {
    child = new FakeChildProcess();
    on = spyOnOn();
  });

  afterEach(() => on.mockRestore());

  const relay = (): void => relaySignals(child as unknown as ChildProcess);

  const raise = (signal: NodeJS.Signals): void => {
    const handler = on.mock.calls.find(([event]) => event === signal)?.[1];
    if (!handler) {
      throw new Error(`No handler registered for ${signal}`);
    }

    handler(signal);
  };

  it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2', 'SIGALRM', 'SIGABRT'])(
    'relays %s to the binary',
    signal => {
      relay();

      raise(signal);

      expect(child.kill).toHaveBeenCalledWith(signal);
    },
  );

  it.each<NodeJS.Signals>(['SIGKILL', 'SIGSTOP', 'SIGCHLD', 'SIGSEGV', 'SIGWINCH', 'SIGTSTP', 'SIGCONT'])(
    'leaves %s to node',
    signal => {
      relay();

      expect(on).not.toHaveBeenCalledWith(signal, expect.anything());
    },
  );

  it('relays an alias such as SIGIOT only once', () => {
    relay();

    const abort = on.mock.calls.filter(([event]) => event === 'SIGABRT' || event === 'SIGIOT');

    expect(abort).toHaveLength(1);
  });

  it.each<NodeJS.Signals>(['SIGINT', 'SIGQUIT'])('traps %s without passing it on', signal => {
    relay();

    raise(signal);

    expect(child.kill).not.toHaveBeenCalled();
  });

  it('skips a signal the platform refuses to trap', () => {
    on.mockImplementationOnce(() => {
      throw new Error('EINVAL');
    });

    expect(relay).not.toThrow();
  });

  it('traps no signals on windows', () => {
    jest.mocked(isWindows).mockReturnValueOnce(true);

    relay();

    expect(on).not.toHaveBeenCalled();
  });
});

describe('exitWithSignal', () => {
  let kill: jest.SpyInstance;
  let removeAllListeners: jest.SpyInstance;

  beforeEach(() => {
    mockExit();
    kill = jest.spyOn(process, 'kill').mockReturnValue(true);
    removeAllListeners = jest.spyOn(process, 'removeAllListeners').mockReturnValue(process);
  });

  afterEach(() => {
    kill.mockRestore();
    removeAllListeners.mockRestore();
  });

  const exitCode = (signal: NodeJS.Signals): number => {
    try {
      exitWithSignal(signal);
    } catch (error) {
      if (error instanceof ProcessExited) {
        return error.code;
      }

      throw error;
    }

    throw new Error('exitWithSignal returned');
  };

  it('kills the process with the signal, without its own listeners', () => {
    expect(() => exitWithSignal('SIGINT')).toThrow(ProcessExited);

    expect(removeAllListeners).toHaveBeenCalledWith('SIGINT');
    expect(kill).toHaveBeenCalledWith(process.pid, 'SIGINT');
  });

  it('exits with 128 + the signal number when the process survives the signal', () => {
    expect(exitCode('SIGINT')).toBe(130);
  });

  it('exits with 128 for a signal the platform does not know', () => {
    expect(exitCode('SIGUNKNOWN' as NodeJS.Signals)).toBe(128);
  });
});
