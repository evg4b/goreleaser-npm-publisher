import { buildExecScript } from './build';

describe('buildExecScript', () => {
  const makePkg = (overrides: Partial<PackageDefinition> = {}): PackageDefinition => ({
    name: overrides.name ?? 'pkg',
    version: overrides.version ?? '1.0.0',
    sourceBinary: overrides.sourceBinary ?? 'srcbin',
    destinationBinary: overrides.destinationBinary ?? 'destbin',
    bin: overrides.bin ?? 'binfile',
    os: overrides.os ?? ('linux'),
    cpu: overrides.cpu ?? ('x64'),
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

    // runtime selection
    expect(code).toContain("const key = process.platform + '_' + process.arch;");
    expect(code).toContain('const definition = mapping[key];');
    expect(code).toContain("const packageJsonPath = require.resolve(path.join(...definition.name, 'package.json'));");
    expect(code).toContain('packagePath = path.join(path.dirname(packageJsonPath), definition.bin);');
    expect(code.trim().endsWith('});')).toBe(true);
  });

  it('replaces the process image via execve when available', () => {
    const code = buildExecScript([makePkg()], undefined);

    expect(code).toContain("typeof process.execve === 'function'");
    expect(code).toContain('process.execve(packagePath, [packagePath, ...args]);');
    // argv[0] must be passed explicitly, execve takes the full argv
    expect(code).not.toContain('process.execve(packagePath, args)');
  });

  it('relays exit codes and signals in the spawn fallback', () => {
    const code = buildExecScript([makePkg()], undefined);

    expect(code).toContain("const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];");
    expect(code).toContain('process.on(signal, () => child.kill(signal));');
    expect(code).toContain('process.exit(signal ? 128 + (os.constants.signals[signal] ?? 0) : (code ?? 0));');
    // the old shim mutated argv and dropped the child's status entirely
    expect(code).not.toContain('process.argv.splice(2)');
  });

  it('fails with a readable message on unsupported platforms', () => {
    const code = buildExecScript([makePkg()], undefined);

    expect(code).toContain('if (!definition) {');
    expect(code).toContain("'Unsupported platform: '");
    expect(code).toContain("console.error('Failed to spawn '");
  });

  it('omits prefix when not provided', () => {
    const pkgs: PackageDefinition[] = [makePkg({ name: 'cli-linux', bin: 'cli', os: 'linux', cpu: 'x64' })];

    const code = buildExecScript(pkgs, undefined);

    // name should contain only the package name when prefix is undefined
    expect(code).toContain("linux_x64: { name: [ 'cli-linux' ], bin: 'cli' }");
  });
});
