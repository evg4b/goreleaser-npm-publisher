import { spawn, spawnSync, SpawnSyncReturns } from 'child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { constants, tmpdir } from 'os';
import { join } from 'path';
import { buildExecScript } from './build';

const CURRENT_OS = process.platform as PackageDefinition['os'];
const CURRENT_CPU = process.arch as PackageDefinition['cpu'];

// Rewrites argv so the shim sees the args as if it had been invoked directly.
// NO_EXECVE forces the spawn fallback.
const RUNNER = `const shim = process.argv[2];
if (process.env.NO_EXECVE) {
  delete process.execve;
}
process.argv = [process.argv[0], shim, ...process.argv.slice(3)];
require(shim);
`;

const makePkg = (overrides: Partial<PackageDefinition> = {}): PackageDefinition => ({
  name: 'tool-native',
  version: '1.0.0',
  sourceBinary: 'srcbin',
  destinationBinary: 'destbin',
  bin: 'tool',
  os: CURRENT_OS,
  cpu: CURRENT_CPU,
  files: [],
  keywords: [],
  ...overrides,
});

type Outcome = {
  /** Exit code as a shell would report it: 128 + signal number when killed. */
  status: number | null;
  stdout: string;
  stderr: string;
};

const signals: Record<string, number> = constants.signals;

const normalize = (result: SpawnSyncReturns<string>): Outcome => ({
  status: result.signal ? 128 + (signals[result.signal] ?? 0) : result.status,
  stdout: result.stdout,
  stderr: result.stderr,
});

class Fixture {
  readonly dir = mkdtempSync(join(tmpdir(), 'exec-script-'));
  readonly shim = join(this.dir, 'shim.cjs');
  readonly runner = join(this.dir, 'runner.cjs');

  constructor(
    packages: PackageDefinition[] = [makePkg()],
    private readonly prefix: string | undefined = undefined,
  ) {
    writeFileSync(this.shim, buildExecScript(packages, prefix));
    writeFileSync(this.runner, RUNNER);
  }

  installBinary(script: string, { name = 'tool-native', bin = 'tool', executable = true } = {}): void {
    const dir = join(this.dir, 'node_modules', ...[this.prefix, name].filter((s): s is string => s != null));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version: '1.0.0' }));
    const binPath = join(dir, bin);
    writeFileSync(binPath, script);
    chmodSync(binPath, executable ? 0o755 : 0o644);
  }

  run(args: string[] = [], { execve = true } = {}): Outcome {
    return normalize(
      spawnSync(process.execPath, [this.runner, this.shim, ...args], {
        encoding: 'utf8',
        env: { ...process.env, ...(execve ? {} : { NO_EXECVE: '1' }) },
      }),
    );
  }

  spawnDetached(args: string[] = [], { execve = true } = {}) {
    return spawn(process.execPath, [this.runner, this.shim, ...args], {
      env: { ...process.env, ...(execve ? {} : { NO_EXECVE: '1' }) },
    });
  }

  cleanup(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}

const posixOnly = process.platform === 'win32' ? describe.skip : describe;
const hasExecve = typeof process.execve === 'function';

posixOnly('generated exec script', () => {
  let fixture: Fixture;

  afterEach(() => fixture?.cleanup());

  const paths: [name: string, execve: boolean][] = [
    ...(hasExecve ? ([['execve', true]] as [string, boolean][]) : []),
    ['spawn fallback', false],
  ];

  describe.each(paths)('%s', (_name, execve) => {
    it('passes through arguments and stdio', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\necho "args:$*"\nread line\necho "echoed:$line"\n');

      const outcome = fixture.run(['--flag', 'value with space'], { execve });

      expect(outcome.stdout).toContain('args:--flag value with space');
      expect(outcome.status).toBe(0);
    });

    it('sets argv[0] to the binary', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\nbasename "$0"\n');

      expect(fixture.run([], { execve }).stdout.trim()).toBe('tool');
    });

    it('relays a non-zero exit code', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\nexit 17\n');

      expect(fixture.run([], { execve }).status).toBe(17);
    });

    it('relays a zero exit code', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\nexit 0\n');

      expect(fixture.run([], { execve }).status).toBe(0);
    });

    it('relays death by signal as 128 + signum', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\nkill -TERM $$\n');

      expect(fixture.run([], { execve }).status).toBe(128 + signals.SIGTERM);
    });

    it('forwards signals sent to the wrapper to the binary', async () => {
      fixture = new Fixture();
      fixture.installBinary(
        `#!/bin/sh
trap 'echo caught; exit 42' TERM
echo ready
while true; do sleep 0.05; done
`,
      );

      const child = fixture.spawnDetached([], { execve });
      let stdout = '';
      child.stdout.on('data', chunk => {
        stdout += chunk;
        if (stdout.includes('ready')) {
          child.kill('SIGTERM');
        }
      });

      const code = await new Promise<number | null>(resolve => child.on('exit', resolve));

      expect(stdout).toContain('caught');
      expect(code).toBe(42);
    });

    it('fails with a readable message when the platform is unsupported', () => {
      fixture = new Fixture([makePkg({ os: 'sunos', cpu: 'mips' as PackageDefinition['cpu'] })]);

      const outcome = fixture.run([], { execve });

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toContain(`Unsupported platform: ${CURRENT_OS}_${CURRENT_CPU}`);
      expect(outcome.stderr).toContain('Supported: sunos_mips');
    });

    it('fails with a readable message when the platform package is not installed', () => {
      fixture = new Fixture();

      const outcome = fixture.run([], { execve });

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toContain('Missing platform package');
    });

    it('fails with a readable message when the binary is not executable', () => {
      fixture = new Fixture();
      fixture.installBinary('#!/bin/sh\nexit 0\n', { executable: false });

      const outcome = fixture.run([], { execve });

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toMatch(/Failed to (exec|spawn) /);
    });
  });

  it('resolves the binary through the prefixed package name', () => {
    fixture = new Fixture([makePkg()], '@acme');
    fixture.installBinary('#!/bin/sh\necho from-scoped-package\n');

    const outcome = fixture.run();

    expect(outcome.status).toBe(0);
    expect(outcome.stdout).toContain('from-scoped-package');
  });
});
