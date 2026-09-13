import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';
import { arch, execPath, platform } from 'node:process';
import { buildShimScript } from './build-shim-script';

/** Runs the shim as if it had been invoked directly, optionally as a node without execve. */
const RUNNER = `const shim = process.argv[2];
if (process.env.NO_EXECVE) {
  delete process.execve;
}
process.argv = [process.argv[0], shim, ...process.argv.slice(3)];
require(shim);
`;

const PACKAGE = 'tool-native';
const BIN = 'tool';

interface Outcome {
  /** Exit code as a shell reports it: 128 + the signal number when killed. */
  status: number | null;
  stdout: string;
  stderr: string;
}

interface Shim {
  install: (script: string, options?: { executable?: boolean }) => void;
  run: (args?: string[]) => Outcome;
  start: () => ChildProcess;
}

const packageFor = (overrides: Partial<PackageDefinition> = {}): PackageDefinition => ({
  name: PACKAGE,
  version: '1.0.0',
  sourceBinary: 'srcbin',
  destinationBinary: 'destbin',
  bin: BIN,
  os: platform,
  cpu: arch,
  files: [],
  keywords: [],
  ...overrides,
});

const directories: string[] = [];

const createShim = (execve: boolean, packages = [packageFor()], prefix?: string): Shim => {
  const directory = mkdtempSync(join(tmpdir(), 'shim-'));
  directories.push(directory);
  const shim = join(directory, 'shim.cjs');
  const runner = join(directory, 'runner.cjs');
  writeFileSync(shim, buildShimScript(packages, prefix));
  writeFileSync(runner, RUNNER);

  const env = { ...process.env, NODE_NO_WARNINGS: '1', ...(execve ? {} : { NO_EXECVE: '1' }) };
  const command = (args: string[]): [string, string[]] => [execPath, [runner, shim, ...args]];

  return {
    install: (script, { executable = true } = {}) => {
      const packagePath = join(directory, 'node_modules', ...[prefix, PACKAGE].filter(part => part != null));
      mkdirSync(packagePath, { recursive: true });
      writeFileSync(join(packagePath, 'package.json'), JSON.stringify({ name: PACKAGE, version: '1.0.0' }));
      writeFileSync(join(packagePath, BIN), script);
      chmodSync(join(packagePath, BIN), executable ? 0o755 : 0o644);
    },
    run: (args = []) => {
      const [file, argv] = command(args);
      const result = spawnSync(file, argv, { encoding: 'utf8', env });

      return {
        status: result.signal ? 128 + constants.signals[result.signal] : result.status,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    },
    start: () => {
      const [file, argv] = command([]);

      return spawn(file, argv, { env });
    },
  };
};

const script = (body: string): string => `#!/bin/sh\n${body}\n`;

const paths: [name: string, execve: boolean][] = [
  ...(typeof process.execve === 'function' ? ([['execve', true]] as [string, boolean][]) : []),
  ['spawn fallback', false],
];

const posixOnly = platform === 'win32' ? describe.skip : describe;

posixOnly('generated shim', () => {
  afterEach(() => {
    directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true }));
  });

  describe.each(paths)('through %s', (_name, execve) => {
    it('passes the arguments through to the binary', () => {
      const shim = createShim(execve);
      shim.install(script('echo "args:$*"'));

      expect(shim.run(['--flag', 'value with space'])).toMatchObject({
        status: 0,
        stdout: 'args:--flag value with space\n',
      });
    });

    it('runs the binary as argv[0]', () => {
      const shim = createShim(execve);
      shim.install(script('basename "$0"'));

      expect(shim.run().stdout.trim()).toBe(BIN);
    });

    it('relays the exit code of the binary', () => {
      const shim = createShim(execve);
      shim.install(script('exit 17'));

      expect(shim.run().status).toBe(17);
    });

    it('relays death by a signal as 128 + the signal number', () => {
      const shim = createShim(execve);
      shim.install(script('kill -TERM $$'));

      expect(shim.run().status).toBe(128 + constants.signals.SIGTERM);
    });

    it('delivers a signal sent to the shim to the binary', async () => {
      const shim = createShim(execve);
      shim.install(script("trap 'echo caught; exit 42' TERM\necho ready\nwhile true; do sleep 0.05; done"));

      const app = shim.start();
      let stdout = '';
      app.stdout?.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
        if (stdout.includes('ready')) {
          app.kill('SIGTERM');
        }
      });
      const status = await new Promise(resolve => app.on('exit', resolve));

      expect({ status, stdout }).toEqual({ status: 42, stdout: 'ready\ncaught\n' });
    });

    it('reports a platform the tool was not published for', () => {
      const shim = createShim(execve, [packageFor({ os: 'sunos', cpu: 'mips' as CPU })]);

      const outcome = shim.run();

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toContain(`Unsupported platform: ${platform}_${arch}. Supported: sunos_mips`);
    });

    it('reports a platform package that is not installed', () => {
      const shim = createShim(execve);

      const outcome = shim.run();

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toContain(`Missing platform package ${PACKAGE} for ${platform}_${arch}.`);
    });

    it('reports a binary that cannot be executed', () => {
      const shim = createShim(execve);
      shim.install(script('exit 0'), { executable: false });

      const outcome = shim.run();

      expect(outcome.status).toBe(1);
      expect(outcome.stderr).toContain('Failed to spawn ');
    });
  });

  it('resolves the binary through a prefixed package name', () => {
    const shim = createShim(true, [packageFor()], '@acme');
    shim.install(script('echo from-scoped-package'));

    expect(shim.run().stdout).toContain('from-scoped-package');
  });
});
