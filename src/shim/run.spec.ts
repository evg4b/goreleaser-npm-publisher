import '@mocks/shim/helpers';

import { FakeChildProcess, mockChildProcess } from '@mocks/child_process';
import { mockExecve, withoutExecve } from '@mocks/execve';
import { mockExit, ProcessExited } from '@mocks/exit';
import { mockSignals } from '@mocks/signals';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { fail, isExecutable, isWindows } from './helpers';
import { run } from './run';

describe('run', () => {
  const env = { PATH: '/usr/bin' };

  let child: FakeChildProcess;

  beforeEach(() => {
    child = mockChildProcess();
  });

  describe('with execve', () => {
    it('replaces the process with the binary, keeping it as argv[0]', async () => {
      const execve = mockExecve();

      await run('/bin/tool', ['--flag'], env);

      expect(isExecutable).toHaveBeenCalledWith('/bin/tool');
      expect(execve).toHaveBeenCalledWith('/bin/tool', ['/bin/tool', '--flag'], env);
      expect(spawn).not.toHaveBeenCalled();
    });

    it('is not used without process.execve', async () => {
      withoutExecve();

      await run('/bin/tool', [], env);

      expect(spawn).toHaveBeenCalled();
    });

    it('is not used on windows', async () => {
      const execve = mockExecve();
      jest.mocked(isWindows).mockReturnValueOnce(true);

      await run('/bin/tool', [], env);

      expect(execve).not.toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
    });

    it('is not used when the binary is not executable', async () => {
      const execve = mockExecve();
      jest.mocked(isExecutable).mockResolvedValueOnce(false);

      await run('/bin/tool', [], env);

      expect(execve).not.toHaveBeenCalled();
      expect(spawn).toHaveBeenCalled();
    });
  });

  describe('as a child process', () => {
    let exit: ReturnType<typeof mockExit>;
    let signals: ReturnType<typeof mockSignals>;

    beforeEach(() => {
      withoutExecve();
      exit = mockExit();
      signals = mockSignals();
    });

    it('spawns the binary with its arguments, inherited stdio and the given environment', async () => {
      await run('/bin/tool', ['--flag'], env);

      expect(spawn).toHaveBeenCalledWith('/bin/tool', ['--flag'], { stdio: 'inherit', env });
    });

    it('exits with the exit code of the binary', async () => {
      await run('/bin/tool', [], env);

      expect(() => child.emit('exit', 42, null)).toThrow(ProcessExited);
      expect(exit).toHaveBeenCalledWith(42);
    });

    it('exits with 0 when the binary reports no exit code', async () => {
      await run('/bin/tool', [], env);

      expect(() => child.emit('exit', null, null)).toThrow(ProcessExited);
      expect(exit).toHaveBeenCalledWith(0);
    });

    it('dies of the signal that killed the binary', async () => {
      await run('/bin/tool', [], env);

      expect(() => child.emit('exit', null, 'SIGTERM')).toThrow(ProcessExited);
      expect(signals.removeAllListeners).toHaveBeenCalledWith('SIGTERM');
      expect(signals.kill).toHaveBeenCalledWith(process.pid, 'SIGTERM');
      expect(exit).toHaveBeenCalledWith(143);
    });

    it('reports a binary that cannot be started', async () => {
      await run('/bin/tool', [], env);

      child.emit('error', new Error('spawn EACCES'));

      expect(fail).toHaveBeenCalledWith('Failed to spawn /bin/tool: spawn EACCES');
    });

    it.each<NodeJS.Signals>(['SIGTERM', 'SIGHUP', 'SIGUSR1', 'SIGUSR2'])('relays %s to the binary', async signal => {
      await run('/bin/tool', [], env);

      signals.raise(signal);

      expect(child.kill).toHaveBeenCalledWith(signal);
    });

    it.each<NodeJS.Signals>(['SIGINT', 'SIGQUIT'])('ignores %s, which reaches the binary on its own', async signal => {
      await run('/bin/tool', [], env);

      signals.raise(signal);

      expect(child.kill).not.toHaveBeenCalled();
    });

    it('handles no signals on windows', async () => {
      jest.mocked(isWindows).mockReturnValue(true);

      await run('/bin/tool', [], env);

      expect(signals.on).not.toHaveBeenCalled();
    });
  });
});
