import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

interface Shim {
  directory: string;
  install: (script: string, options?: { executable?: boolean }) => void;
  run: (args?: string[], input?: string) => Outcome;
  start: () => ChildProcess;
}

interface Scenario {
  binary?: { body: string; executable?: boolean };
  packages?: PackageDefinition[];
  args?: string[];
  input?: string;
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
    directory,
    install: (script, { executable = true } = {}) => {
      const packagePath = join(directory, 'node_modules', ...[prefix, PACKAGE].filter(part => part != null));
      mkdirSync(packagePath, { recursive: true });
      writeFileSync(join(packagePath, 'package.json'), JSON.stringify({ name: PACKAGE, version: '1.0.0' }));
      writeFileSync(join(packagePath, BIN), script);
      chmodSync(join(packagePath, BIN), executable ? 0o755 : 0o644);
    },
    run: (args = [], input = '') => {
      const [file, argv] = command(args);
      const result = spawnSync(file, argv, { encoding: 'utf8', env, input });

      return { status: result.status, signal: result.signal, stdout: result.stdout, stderr: result.stderr };
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
    it('passes the arguments and standard input through to the binary', () => {
      const shim = createShim(execve);
      shim.install(script('read line\necho "args:$* in:$line"'));

      expect(shim.run(['--flag', 'value with space'], 'typed\n')).toEqual({
        status: 0,
        signal: null,
        stdout: 'args:--flag value with space in:typed\n',
        stderr: '',
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

    it('dies of the signal the binary died of', () => {
      const shim = createShim(execve);
      shim.install(script('kill -TERM $$'));

      expect(shim.run()).toMatchObject({ status: null, signal: 'SIGTERM' });
    });

    it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGALRM'])(
      'delivers %s sent to the shim to the binary',
      async signal => {
        const shim = createShim(execve);
        shim.install(
          script(`trap 'echo caught; exit 42' ${signal.slice(3)}\necho ready\nwhile true; do sleep 0.05; done`),
        );

        const app = shim.start();
        let stdout = '';
        app.stdout?.on('data', (chunk: Buffer) => {
          stdout += chunk.toString();
          if (stdout.includes('ready')) {
            app.kill(signal);
          }
        });
        const status = await new Promise(resolve => app.on('exit', resolve));

        expect({ status, stdout }).toEqual({ status: 42, stdout: 'ready\ncaught\n' });
      },
    );

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

  describe('runs a binary the same way through execve and through the fallback', () => {
    const scenarios: [name: string, scenario: Scenario][] = [
      ['output and exit code', { binary: { body: 'echo out; echo err >&2; exit 17' }, args: ['--flag', 'a b'] }],
      ['the name it was started under', { binary: { body: 'basename "$0"' } }],
      ['standard input', { binary: { body: 'read line; echo "echoed:$line"' }, input: 'typed\n' }],
      ['death by a signal', { binary: { body: 'kill -TERM $$' } }],
      ['a binary that cannot be executed', { binary: { body: 'exit 0', executable: false } }],
      ['a package that is not installed', {}],
      ['a platform the tool was not published for', { packages: [packageFor({ os: 'sunos', cpu: 'mips' as CPU })] }],
    ];

    const outcomeOf = ({ binary, packages, args, input }: Scenario, execve: boolean): Outcome => {
      const shim = createShim(execve, packages);
      if (binary) {
        shim.install(script(binary.body), binary);
      }

      const outcome = shim.run(args, input);

      return { ...outcome, stderr: outcome.stderr.replaceAll(shim.directory, '<shim>') };
    };

    it.each(scenarios)('%s', (_name, scenario) => {
      expect(outcomeOf(scenario, false)).toEqual(outcomeOf(scenario, true));
    });
  });

  it('resolves the binary through a prefixed package name', () => {
    const shim = createShim(true, [packageFor()], '@acme');
    shim.install(script('echo from-scoped-package'));

    expect(shim.run().stdout).toContain('from-scoped-package');
  });
});
