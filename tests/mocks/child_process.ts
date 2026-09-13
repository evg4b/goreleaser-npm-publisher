import { spawn, type ChildProcess } from 'node:child_process';

jest.mock('node:child_process', () => ({
  spawn: jest.fn().mockName('spawn'),
}));

export class FakeChildProcess {
  public readonly kill = jest.fn().mockName('kill');

  private readonly handlers = new Map<string, (...args: unknown[]) => void>();

  public on(event: string, callback: (...args: unknown[]) => void): this {
    this.handlers.set(event, callback);
    return this;
  }

  public emit(event: string, ...args: unknown[]): void {
    this.handlers.get(event)?.(...args);
  }
}

export const mockChildProcess = (): FakeChildProcess => {
  const child = new FakeChildProcess();
  jest.mocked(spawn).mockReturnValue(child as unknown as ChildProcess);

  return child;
};
