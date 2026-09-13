import '@mocks/child_process';
import '@mocks/npm/context';
import '@mocks/os';

import { ChildProcess, spawn } from 'node:child_process';
import { platform } from 'node:os';
import { execInContext } from '@npm/context';
import { npmExec } from './exec';

class FakeStream {
  private callbacks = new Map<string, (...args: unknown[]) => void>();

  public on(type: string, callback: (...args: unknown[]) => void): void {
    this.callbacks.set(type, callback);
  }

  public emit(type: string, ...args: unknown[]): void {
    const callback = this.callbacks.get(type);
    callback?.(...args);
  }

  public isRegistered(type: string): boolean {
    return this.callbacks.has(type);
  }
}

class ProcessMock extends FakeStream {
  public stdout = new FakeStream();
  public stderr = new FakeStream();
}

const execCommand = (processMock: ProcessMock): Promise<string> => {
  jest.mocked(spawn).mockReturnValue(processMock as unknown as ChildProcess);
  jest.mocked(execInContext).mockImplementation((_, action) => action(process.env));
  const responsePromise = npmExec<string>(['whoami']);
  processMock.stdout.emit('data', JSON.stringify('evg4b'));
  processMock.emit('close', 0);
  return responsePromise;
};

describe('exec', () => {
  beforeEach(() => {
    jest.mocked(execInContext).mockImplementation((_, action) => action(process.env));
  });

  describe('base command', () => {
    let processMock: ProcessMock;
    let execPromise: Promise<string>;

    beforeEach(() => {
      processMock = new ProcessMock();
      execPromise = execCommand(processMock);
    });

    it('Should return parsed value', async () => {
      expect(await execPromise).toEqual('evg4b');
    });

    it('Should handle correct events', () => {
      expect(processMock.stdout.isRegistered('data')).toBe(true);
      expect(processMock.stderr.isRegistered('data')).toBe(true);
      expect(processMock.isRegistered('close')).toBe(true);
      expect(processMock.isRegistered('error')).toBe(true);
    });

    it('Should executed in context', () => {
      expect(execInContext).toHaveBeenCalled();
    });

    it('Should execute with json param', () => {
      expect(jest.mocked(spawn).mock.calls[0][1]).toContain('--json');
    });
  });

  describe('non-zero exit code', () => {
    it('should reject with NpmExecError', async () => {
      const processMock = new ProcessMock();
      jest.mocked(spawn).mockReturnValue(processMock as unknown as ChildProcess);
      const errorBody = JSON.stringify({ error: { code: 'E403', summary: 'Forbidden', detail: 'No access' } });
      const responsePromise = npmExec<string>(['publish']);
      processMock.stdout.emit('data', errorBody);
      processMock.emit('close', 1);

      await expect(responsePromise).rejects.toMatchObject({ code: 'E403', message: '[E403]: Forbidden' });
    });
  });

  describe('depends on platform', () => {
    const platforms = ['darwin', 'linux', 'android', 'aix', 'freebsd', 'openbsd', 'sunos', 'netbsd'];

    it.each(platforms)(`should use npm for %s`, platformName => {
      jest.mocked(platform).mockReturnValue(platformName as NodeJS.Platform);

      const processMock = new ProcessMock();
      void execCommand(processMock);

      expect(jest.mocked(spawn).mock.calls[0][0]).toEqual('npm');
    });

    it('should use a quoted npm.cmd command line', () => {
      jest.mocked(platform).mockReturnValue('win32');

      const processMock = new ProcessMock();
      void execCommand(processMock);

      expect(jest.mocked(spawn).mock.calls[0][0]).toEqual('npm.cmd --json whoami');
      expect(jest.mocked(spawn).mock.calls[0][1]).toMatchObject({ shell: true });
    });

    it('should quote arguments passed through the windows shell', () => {
      jest.mocked(platform).mockReturnValue('win32');

      const processMock = new ProcessMock();
      jest.mocked(spawn).mockReturnValue(processMock as unknown as ChildProcess);
      void npmExec<string>(['publish', '--otp', 'one time pass']);

      expect(jest.mocked(spawn).mock.calls[0][0]).toEqual('npm.cmd --json publish --otp "one time pass"');
    });
  });
});
