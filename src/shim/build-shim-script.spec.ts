import '@mocks/helpers/fs';

import { Script } from 'node:vm';
import { buildShimScript } from './build-shim-script';

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

  const inlinedMapping = (code: string): unknown => {
    const match = /mapping = (\{.*?\});/.exec(code);
    if (!match) {
      throw new Error(`No inlined mapping found in:\n${code}`);
    }

    return JSON.parse(match[1]);
  };

  it('inlines the compiled shim rather than reading it from disk', () => {
    const code = buildShimScript([makePkg()], undefined);

    expect(code).toContain('#!/usr/bin/env node');
    expect(code).toContain('node:child_process');
    expect(code).not.toContain('__INLINE_MAPPING__');
  });

  it('replaces the placeholder with the mapping for multiple packages', () => {
    const pkgs = [
      makePkg({ name: 'tool-linux', bin: 'tool', os: 'linux', cpu: 'x64' }),
      makePkg({ name: 'tool-darwin', bin: 'tool', os: 'darwin', cpu: 'arm64' }),
    ];

    const code = buildShimScript(pkgs, '@acme');

    expect(inlinedMapping(code)).toEqual({
      linux_x64: { name: ['@acme', 'tool-linux'], bin: 'tool' },
      darwin_arm64: { name: ['@acme', 'tool-darwin'], bin: 'tool' },
    });
  });

  it('omits prefix when not provided', () => {
    const pkgs = [makePkg({ name: 'cli-linux', bin: 'cli', os: 'linux', cpu: 'x64' })];

    const code = buildShimScript(pkgs, undefined);

    expect(inlinedMapping(code)).toEqual({ linux_x64: { name: ['cli-linux'], bin: 'cli' } });
  });

  it('produces an empty mapping when there are no packages', () => {
    const code = buildShimScript([], undefined);

    expect(inlinedMapping(code)).toEqual({});
  });

  it('produces a syntactically valid script', () => {
    const code = buildShimScript([makePkg()], undefined);

    expect(() => new Script(code.replace('#!/usr/bin/env node', ''))).not.toThrow();
  });
});
