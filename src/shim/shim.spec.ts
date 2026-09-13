import '@mocks/child_process';

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { arch, platform } from 'node:process';
import { buildShimScript } from './build-shim-script';

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

const packageFor = (name: string, bin: string): PackageDefinition => ({
  name,
  version: '1.0.0',
  sourceBinary: 'srcbin',
  destinationBinary: 'destbin',
  bin,
  os: platform,
  cpu: arch,
  files: [],
  keywords: [],
});

const runShim = (packages: PackageDefinition[], prefix?: string): FakeChildProcess => {
  const child = new FakeChildProcess();
  jest.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);
  const script = buildShimScript(packages, prefix).replace('#!/usr/bin/env node', '');

  eval(script);

  return child;
};

const binaryIn = (pkg: string, bin: string): string => join(dirname(require.resolve(`${pkg}/package.json`)), bin);

describe('shim', () => {
  it('spawns the binary of the package matching the current platform', () => {
    runShim([packageFor('node', 'tool')], '@types');

    expect(spawn).toHaveBeenCalledWith(binaryIn('@types/node', 'tool'), expect.anything(), expect.anything());
  });

  it('resolves an unprefixed package name', () => {
    runShim([packageFor('typescript', 'bin/tsc')]);

    expect(spawn).toHaveBeenCalledWith(binaryIn('typescript', 'bin/tsc'), expect.anything(), expect.anything());
  });

  it('forwards the cli arguments to the binary', () => {
    runShim([packageFor('typescript', 'tool')]);

    expect(spawn).toHaveBeenCalledWith(expect.any(String), process.argv.slice(2), expect.anything());
  });

  it('inherits stdio and the current environment', () => {
    runShim([packageFor('typescript', 'tool')]);

    expect(spawn).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      stdio: 'inherit',
      env: process.env,
    });
  });

  it('propagates the exit code of the spawned binary', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    try {
      const child = runShim([packageFor('typescript', 'tool')]);

      child.emit('exit', 42);

      expect(exitSpy).toHaveBeenCalledWith(42);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP'])('forwards %s to the binary', signal => {
    const onSpy = jest.spyOn(process, 'on');
    try {
      const child = runShim([packageFor('typescript', 'tool')]);
      const handler = onSpy.mock.calls.find(([event]) => event === signal)?.[1];
      handler?.(signal);

      expect(child.kill).toHaveBeenCalledWith(signal);
    } finally {
      onSpy.mockRestore();
    }
  });

  it('listens for SIGINT without passing it on', () => {
    const onSpy = jest.spyOn(process, 'on');
    try {
      const child = runShim([packageFor('typescript', 'tool')]);
      const handler = onSpy.mock.calls.find(([event]) => event === 'SIGINT')?.[1];
      handler?.('SIGINT');

      expect(child.kill).not.toHaveBeenCalled();
    } finally {
      onSpy.mockRestore();
    }
  });

  it('reports a binary killed by a signal as 128 + the signal number', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    try {
      const child = runShim([packageFor('typescript', 'tool')]);

      child.emit('exit', null, 'SIGINT');

      expect(exitSpy).toHaveBeenCalledWith(130);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it('fails when no package matches the current platform', () => {
    const foreign = { ...packageFor('typescript', 'tool'), os: 'sunos' as OS };

    expect(() => runShim([foreign])).toThrow();
  });
});
