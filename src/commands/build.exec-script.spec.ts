import { buildExecScript } from './build';

describe('buildExecScript', () => {
  const makePkg = (overrides: Partial<PackageDefinition> = {}): PackageDefinition => ({
    name: overrides.name ?? 'pkg',
    version: overrides.version ?? '1.0.0',
    sourceBinary: overrides.sourceBinary ?? 'srcbin',
    destinationBinary: overrides.destinationBinary ?? 'destbin',
    bin: overrides.bin ?? 'binfile',
    os: overrides.os ?? ('linux' as typeof process.platform),
    cpu: overrides.cpu ?? ('x64' as typeof process.arch),
    files: overrides.files ?? [],
    keywords: overrides.keywords ?? [],
    license: overrides.license,
  });

  it('generates a runnable script with prefix and correct mapping for multiple packages', () => {
    const pkgs: PackageDefinition[] = [
      makePkg({ name: 'tool-linux', bin: 'tool', os: 'linux', cpu: 'x64' }),
      makePkg({ name: 'tool-darwin', bin: 'tool', os: 'darwin', cpu: 'arm64' }),
    ];

    const code = buildExecScript(pkgs, '@acme');

    // shebang and required modules
    expect(code.startsWith('#!/usr/bin/env node')).toBe(true);
    expect(code).toContain("const path = require('path');");
    expect(code).toContain("const child_process = require('child_process');");

    // mapping must include both platforms with prefix in name array
    expect(code).toContain("linux_x64: { name: [ '@acme', 'tool-linux' ], bin: 'tool' }");
    expect(code).toContain("darwin_arm64: { name: [ '@acme', 'tool-darwin' ], bin: 'tool' }");

    // runtime selection and spawn
    expect(code).toContain("const definition = mapping[process.platform + '_' + process.arch];");
    expect(code).toContain("const packageJsonPath = require.resolve(path.join(...definition.name, 'package.json'));");
    expect(code).toContain('const packagePath = path.join(path.dirname(packageJsonPath), definition.bin);');
    expect(code.trim().endsWith('});')).toBe(true);
  });

  it('omits prefix when not provided', () => {
    const pkgs: PackageDefinition[] = [makePkg({ name: 'cli-linux', bin: 'cli', os: 'linux', cpu: 'x64' })];

    const code = buildExecScript(pkgs, undefined);

    // name should contain only the package name when prefix is undefined
    expect(code).toContain("linux_x64: { name: [ 'cli-linux' ], bin: 'cli' }");
  });
});
