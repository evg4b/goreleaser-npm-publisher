const mockSpawn = jest.fn();
jest.mock('child_process', () => ({ spawn: mockSpawn }));

import { dirname, join } from 'node:path';

const currentPlatform = `${process.platform}_${process.arch}`;

class FakeChildProcess {
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
  mockSpawn.mockReturnValue(child);
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

    expect(mockSpawn).toHaveBeenCalledWith(binaryIn('@types/node', 'tool'), expect.anything(), expect.anything());
  });

  it('resolves an unprefixed package name', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'bin/tsc' } });

    expect(mockSpawn).toHaveBeenCalledWith(binaryIn('typescript', 'bin/tsc'), expect.anything(), expect.anything());
  });

  it('forwards the cli arguments to the binary', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

    expect(mockSpawn).toHaveBeenCalledWith(expect.any(String), process.argv.slice(2), expect.anything());
  });

  it('inherits stdio and the current environment', async () => {
    await runShim({ [currentPlatform]: { name: ['typescript'], bin: 'tool' } });

    expect(mockSpawn).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
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

  it('fails when no package matches the current platform', async () => {
    await expect(runShim({ some_other_platform: { name: ['typescript'], bin: 'tool' } })).rejects.toThrow();
  });
});
