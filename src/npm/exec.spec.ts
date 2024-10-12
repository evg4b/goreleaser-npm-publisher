const spawnMock = jest.fn();
jest.mock('node:child_process', () => ({ spawn: spawnMock }));

const execInContextMock = jest.fn((_, action: (env: unknown) => unknown): unknown => {
  return action(process.env);
});
jest.mock('./context', () => ({ execInContext: execInContextMock }));

import { npmExec } from './exec';

class FakeStream {
  private callbacks = new Map<string, (...args: unknown[]) => void>;

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

describe('exec', () => {
  describe('base command', () => {
    let processMock: ProcessMock;
    let execPromise: Promise<string>;

    beforeEach(() => {
      processMock = new ProcessMock();
      spawnMock.mockReturnValue(processMock);
      execPromise = npmExec(['whoami']);
      processMock.stdout.emit('data', JSON.stringify('evg4b'));
      processMock.emit('close', 0);
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
      expect(execInContextMock).toHaveBeenCalled();
    });

    it('Should execute with json param', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(spawnMock.mock.calls[0][1]).toContain('--json');
    })
  });
});
