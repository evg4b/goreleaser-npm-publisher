import { yellow } from 'picocolors';

export class ConsoleLogger implements Logger {
  constructor(
    private readonly output: typeof console,
    private readonly verbose: boolean,
  ) {}

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
    this.output.warn(yellow(message.toString()));
  }

  error(message: string | Error): void {
    this.output.error(message);
  }

  debug(message: string): void {
    if (this.verbose) {
      this.output.debug(message);
    }
  }
}
