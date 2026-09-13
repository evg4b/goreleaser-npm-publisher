import '@mocks/fs/access';
import { mockChildProcess } from '@mocks/child_process';
import { mockExecve, withoutExecve } from '@mocks/execve';
import { mockExit, ProcessExited } from '@mocks/exit';

import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { arch, execPath, platform } from 'node:process';
import { setImmediate as flushMicrotasks } from 'node:timers/promises';
import { buildShimScript } from './build-shim-script';

interface Invocation {
  prefix?: string;
  args?: string[];
  installed?: boolean;
}

const packageFor = (name: string, os: OS = platform): PackageDefinition => ({
  name,
  version: '1.0.0',
  sourceBinary: 'srcbin',
  destinationBinary: 'destbin',
  bin: 'bin/tool',
  os,
  cpu: arch,
  files: [],
  keywords: [],
});

const TOOL = packageFor('tool-native');

const spyOnOn = () => jest.spyOn(process, 'on').mockReturnValue(process);

describe('shim', () => {
  let directory: string;
  let exit: ReturnType<typeof mockExit>;
  let on: ReturnType<typeof spyOnOn>;
  let error: jest.SpyInstance;

  beforeEach(async () => {
    directory = await realpath(await mkdtemp(join(tmpdir(), 'shim-')));
    mockChildProcess();
    exit = mockExit();
    on = spyOnOn();
    error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
    on.mockRestore();
    error.mockRestore();
  });

  const binaryOf = (...name: string[]): string => join(directory, 'node_modules', ...name, TOOL.bin);

  const install = (packages: PackageDefinition[], prefix?: string): Promise<unknown[]> =>
    Promise.all(
      packages.map(async ({ name }) => {
        const path = join(directory, 'node_modules', ...[prefix, name].filter(part => part != null));
        await mkdir(path, { recursive: true });

        return writeFile(join(path, 'package.json'), JSON.stringify({ name, version: '1.0.0' }));
      }),
    );

  /** Loads the generated shim the way node would, with the mocks of this suite in place. */
  const runShim = async (
    packages: PackageDefinition[],
    { prefix, args = [], installed = true }: Invocation = {},
  ): Promise<void> => {
    if (installed) {
      await install(packages, prefix);
    }

    const file = join(directory, 'shim.cjs');
    await writeFile(file, buildShimScript(packages, prefix));
    const argv = process.argv;
    process.argv = [execPath, file, ...args];

    try {
      jest.isolateModules(() => {
        jest.requireActual(file);
      });
    } finally {
      process.argv = argv;
    }

    await flushMicrotasks();
  };

  describe('where execve can run the binary', () => {
    it('replaces itself with the binary of the package matching the current platform', async () => {
      const execve = mockExecve();

      await runShim([TOOL]);

      expect(execve).toHaveBeenCalledWith(binaryOf('tool-native'), [binaryOf('tool-native')], process.env);
      expect(access).toHaveBeenCalledWith(binaryOf('tool-native'), expect.any(Number));
    });

    it('resolves a prefixed package name', async () => {
      const execve = mockExecve();

      await runShim([TOOL], { prefix: '@acme' });

      expect(execve).toHaveBeenCalledWith(binaryOf('@acme', 'tool-native'), expect.anything(), expect.anything());
    });

    it('forwards the command line arguments, with the binary as argv[0]', async () => {
      const execve = mockExecve();

      await runShim([TOOL], { args: ['--flag', 'value with space'] });

      const binary = binaryOf('tool-native');
      expect(execve).toHaveBeenCalledWith(binary, [binary, '--flag', 'value with space'], process.env);
    });

    it('starts a binary it cannot execute as a child process instead', async () => {
      mockExecve();
      jest.mocked(access).mockRejectedValue(new Error('EACCES'));

      await runShim([TOOL]);

      expect(spawn).toHaveBeenCalledWith(binaryOf('tool-native'), [], expect.anything());
    });
  });

  describe('where execve is not available', () => {
    beforeEach(withoutExecve);

    it('runs the binary as a child process, with its arguments and the current environment', async () => {
      await runShim([TOOL], { args: ['--flag'] });

      expect(spawn).toHaveBeenCalledWith(binaryOf('tool-native'), ['--flag'], {
        stdio: 'inherit',
        env: process.env,
      });
    });
  });

  describe('reports what it cannot run', () => {
    it('a platform the tool was not published for', async () => {
      await expect(runShim([packageFor('tool-native', 'sunos')])).rejects.toThrow(ProcessExited);

      expect(error).toHaveBeenCalledWith(`Unsupported platform: ${platform}_${arch}. Supported: sunos_${arch}`);
      expect(exit).toHaveBeenCalledWith(1);
    });

    it('a platform package that is not installed', async () => {
      await expect(runShim([TOOL], { prefix: '@acme', installed: false })).rejects.toThrow(ProcessExited);

      expect(error).toHaveBeenCalledWith(
        `Missing platform package @acme/tool-native for ${platform}_${arch}. Reinstall without --no-optional.`,
      );
      expect(exit).toHaveBeenCalledWith(1);
    });
  });
});
