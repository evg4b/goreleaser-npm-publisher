import { type Logger } from './logger';

export class ConsoleLogger implements Logger {
  constructor(private readonly output: typeof console) {}

  async group<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.output.group(name);
    try {
      return await fn();
    } finally {
      this.output.groupEnd();
    }
  }

  info(message: string): void {
    this.output.log(message);
  }

  warning(message: string | Error): void {
    this.output.warn(message);
  }

  error(message: string | Error): void {
    this.output.error(message);
  }

  debug(message: string): void {
    this.output.debug(message);
  }
}
