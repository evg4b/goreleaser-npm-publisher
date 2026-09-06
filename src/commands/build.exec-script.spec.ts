const mockReadFile = jest.fn();
jest.mock('../helpers/fs', () => ({
  copyFile: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: mockReadFile,
}));

import { readFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { buildShimScript } from './build';

const SHIM_TEMPLATE = 'var mapping = __INLINE_MAPPING__;\nconsole.log(mapping);';

describe('buildShimScript', () => {
  const makePkg = (overrides: Partial<PackageDefinition> = {}): PackageDefinition => ({
    name: overrides.name ?? 'pkg',
    version: overrides.version ?? '1.0.0',
    sourceBinary: overrides.sourceBinary ?? 'srcbin',
    destinationBinary: overrides.destinationBinary ?? 'destbin',
    bin: overrides.bin ?? 'binfile',
    os: overrides.os ?? 'linux',
    cpu: overrides.cpu ?? 'x64',
    files: overrides.files ?? [],
    keywords: overrides.keywords ?? [],
    license: overrides.license,
  });

  const inlinedMapping = (code: string): unknown => JSON.parse(code.slice('var mapping = '.length, -';'.length));

  beforeEach(() => {
    mockReadFile.mockResolvedValue('var mapping = __INLINE_MAPPING__;');
  });

  it('reads the prebundled shim sitting next to the current bundle', async () => {
    await buildShimScript([makePkg()], undefined);

    expect(mockReadFile).toHaveBeenCalledWith(expect.stringContaining(`${sep}shim.cjs`));
  });

  it('replaces the placeholder with the mapping for multiple packages', async () => {
    const pkgs = [
      makePkg({ name: 'tool-linux', bin: 'tool', os: 'linux', cpu: 'x64' }),
      makePkg({ name: 'tool-darwin', bin: 'tool', os: 'darwin', cpu: 'arm64' }),
    ];

    const code = await buildShimScript(pkgs, '@acme');

    expect(inlinedMapping(code)).toEqual({
      linux_x64: { name: ['@acme', 'tool-linux'], bin: 'tool' },
      darwin_arm64: { name: ['@acme', 'tool-darwin'], bin: 'tool' },
    });
  });

  it('omits prefix when not provided', async () => {
    const pkgs = [makePkg({ name: 'cli-linux', bin: 'cli', os: 'linux', cpu: 'x64' })];

    const code = await buildShimScript(pkgs, undefined);

    expect(inlinedMapping(code)).toEqual({ linux_x64: { name: ['cli-linux'], bin: 'cli' } });
  });

  it('keeps the rest of the shim untouched', async () => {
    mockReadFile.mockResolvedValue(SHIM_TEMPLATE);

    const code = await buildShimScript([makePkg()], undefined);

    expect(code).not.toContain('__INLINE_MAPPING__');
    expect(code).toContain('console.log(mapping);');
  });

  it('produces an empty mapping when there are no packages', async () => {
    const code = await buildShimScript([], undefined);

    expect(inlinedMapping(code)).toEqual({});
  });

  it('substitutes the placeholder that the real shim source declares', async () => {
    const shimSource = await readFile(join(__dirname, '..', 'shim.ts'), 'utf8');

    expect(shimSource).toContain('__INLINE_MAPPING__');
  });
});
