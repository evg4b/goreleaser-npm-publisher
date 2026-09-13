import { mockChildProcess } from '@mocks/child_process';

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

const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

const binaryIn = (pkg: string, bin: string): string => join(dirname(require.resolve(`${pkg}/package.json`)), bin);

describe('shim', () => {
  let on: ReturnType<typeof spyOnOn>;

  beforeEach(() => (on = spyOnOn()));

  afterEach(() => on.mockRestore());

  it('runs the binary of the package matching the current platform', () => {
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

  it('runs the binary with the current environment', () => {
    runShim([packageFor('typescript', 'tool')]);

    expect(spawn).toHaveBeenCalledWith(expect.any(String), expect.anything(), { stdio: 'inherit', env: process.env });
  });

  it('fails when no package matches the current platform', () => {
    const foreign = { ...packageFor('typescript', 'tool'), os: 'sunos' as OS };

    expect(() => runShim([foreign])).toThrow();
  });
});
