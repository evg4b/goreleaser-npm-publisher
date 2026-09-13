jest.mock('./fail', () => ({
  fail: jest.fn().mockName('fail'),
}));

import { dirname, join } from 'node:path';
import { fail } from './fail';
import { resolveBinary } from './resolve';

describe('resolveBinary', () => {
  const mapping: Mapping = {
    linux_x64: { name: ['typescript'], bin: 'bin/tsc' },
    darwin_arm64: { name: ['@types', 'node'], bin: 'tool' },
  };

  const packagePath = (pkg: string): string => dirname(require.resolve(`${pkg}/package.json`));

  it('resolves the binary inside the package of the given platform', () => {
    expect(resolveBinary(mapping, 'linux_x64')).toBe(join(packagePath('typescript'), 'bin/tsc'));
  });

  it('resolves a prefixed package name', () => {
    expect(resolveBinary(mapping, 'darwin_arm64')).toBe(join(packagePath('@types/node'), 'tool'));
  });

  it('fails with the supported platforms when the current one is not published', () => {
    resolveBinary(mapping, 'sunos_mips');

    expect(fail).toHaveBeenCalledWith('Unsupported platform: sunos_mips. Supported: linux_x64, darwin_arm64');
  });

  it('fails when the package of the current platform is not installed', () => {
    resolveBinary({ linux_x64: { name: ['@acme', 'missing-tool'], bin: 'tool' } }, 'linux_x64');

    expect(fail).toHaveBeenCalledWith(
      'Missing platform package @acme/missing-tool for linux_x64. Reinstall without --no-optional.',
    );
  });
});
