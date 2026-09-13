import { mockChildProcess } from '@mocks/child_process';
import { mockExecve, withoutExecve } from '@mocks/execve';

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

  beforeEach(() => (on = spyOnOn()));

  afterEach(() => on.mockRestore());

  describe('where execve is supported', () => {
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

  describe('where execve is not supported', () => {
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

    expect(() => runShim([foreign])).toThrow();
  });
});
