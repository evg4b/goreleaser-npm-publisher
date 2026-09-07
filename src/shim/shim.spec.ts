import '@mocks/child_process';

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';

const currentPlatform = `${process.platform}_${process.arch}`;

class FakeChildProcess {
  public readonly kill = jest.fn();

  private readonly handlers = new Map<string, (...args: unknown[]) => void>();

  public on(event: string, callback: (...args: unknown[]) => void): this {
    this.handlers.set(event, callback);
    return this;
  }

  public emit(event: string, ...args: unknown[]): void {
    this.handlers.get(event)?.(...args);
  }
}

const runShim = async (mapping: Mapping): Promise<FakeChildProcess> => {
  const child = new FakeChildProcess();
  jest.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);
  (globalThis as Record<string, unknown>).__INLINE_MAPPING__ = mapping;
  await jest.isolateModulesAsync(async () => {
    await import('./shim');
  });

  return child;
};

const binaryIn = (pkg: string, bin: string): string => join(dirname(require.resolve(`${pkg}/package.json`)), bin);

describe('shim', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__INLINE_MAPPING__;
  });

  it('spawns the binary of the package matching the current platform', async () => {
    await runShim({ [currentPlatform]: { name: ['@types', 'node'], bin: 'tool' } });

    expect(spawn).toHaveBeenCalledWith(binaryIn('@types/node', 'tool'), expect.anything(), expect.anything());
  });

  it('resolves an unprefixed package name', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'bin/tsc' } });

    expect(spawn).toHaveBeenCalledWith(binaryIn('typescript', 'bin/tsc'), expect.anything(), expect.anything());
  });

  it('forwards the cli arguments to the binary', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

    expect(spawn).toHaveBeenCalledWith(expect.any(String), process.argv.slice(2), expect.anything());
  });

  it('inherits stdio and the current environment', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

    expect(spawn).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      stdio: 'inherit',
      env: process.env,
    });
  });

  it('propagates the exit code of the spawned binary', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    try {
      const child = await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

      child.emit('exit', 42);

      expect(exitSpy).toHaveBeenCalledWith(42);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP'])('forwards %s to the binary', async signal => {
    const onSpy = jest.spyOn(process, 'on');
    try {
      const child = await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });
      const handler = onSpy.mock.calls.find(([event]) => event === signal)?.[1];
      handler?.(signal);

      expect(child.kill).toHaveBeenCalledWith(signal);
    } finally {
      onSpy.mockRestore();
    }
  });

  it('listens for SIGINT without passing it on', async () => {
    const onSpy = jest.spyOn(process, 'on');
    try {
      const child = await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });
      const handler = onSpy.mock.calls.find(([event]) => event === 'SIGINT')?.[1];
      handler?.('SIGINT');

      expect(child.kill).not.toHaveBeenCalled();
    } finally {
      onSpy.mockRestore();
    }
  });

  it('reports a binary killed by a signal as 128 + the signal number', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    try {
      const child = await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

      child.emit('exit', null, 'SIGINT');

      expect(exitSpy).toHaveBeenCalledWith(130);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it('fails when no package matches the current platform', async () => {
    await expect(runShim({ some_other_platform: { name: ['typescript'], bin: 'tool' } })).rejects.toThrow();
  });
});
