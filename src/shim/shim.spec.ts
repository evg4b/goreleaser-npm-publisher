import '@mocks/fs';
import { mockChildProcess } from '@mocks/child_process';
import { mockExecve, withoutExecve } from '@mocks/execve';
import { mockExit, ProcessExited } from '@mocks/exit';

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { arch, platform } from 'node:process';
import { buildShimScript } from './build-shim-script';

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

const runShim = (packages: PackageDefinition[], prefix?: string): void => {
  mockChildProcess();
  const script = buildShimScript(packages, prefix).replace('#!/usr/bin/env node', '');

  eval(script);
};

const binaryIn = (pkg: string, bin: string): string => join(dirname(require.resolve(`${pkg}/package.json`)), bin);

const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

describe('shim', () => {
  let on: ReturnType<typeof spyOnOn>;
  let error: jest.SpyInstance;

  beforeEach(() => {
    on = spyOnOn();
    error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    on.mockRestore();
    error.mockRestore();
  });

  describe('where execve can run the binary', () => {
    it('replaces itself with the binary of the package matching the current platform', () => {
      const execve = mockExecve();

      runShim([packageFor('node', 'tool')], '@types');

      const binary = binaryIn('@types/node', 'tool');
      expect(execve).toHaveBeenCalledWith(binary, [binary, ...process.argv.slice(2)], process.env);
    });

    it('resolves an unprefixed package name', () => {
      const execve = mockExecve();

      runShim([packageFor('typescript', 'bin/tsc')]);

      expect(execve).toHaveBeenCalledWith(binaryIn('typescript', 'bin/tsc'), expect.anything(), expect.anything());
    });
  });

  describe('where execve is not available', () => {
    beforeEach(withoutExecve);

    it('runs the binary as a child process', () => {
      runShim([packageFor('typescript', 'bin/tsc')]);

      expect(spawn).toHaveBeenCalledWith(binaryIn('typescript', 'bin/tsc'), process.argv.slice(2), {
        stdio: 'inherit',
        env: process.env,
      });
    });
  });

  it('fails when no package matches the current platform', () => {
    const foreign = { ...packageFor('typescript', 'tool'), os: 'sunos' as OS };
    const exit = mockExit();

    expect(() => runShim([foreign])).toThrow(ProcessExited);

    expect(error).toHaveBeenCalledWith(`Unsupported platform: ${platform}_${arch}. Supported: sunos_${arch}`);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
