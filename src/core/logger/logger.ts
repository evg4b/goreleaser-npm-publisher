export interface Logger {
  group<T>(name: string, fn: () => Promise<T>): Promise<T>;
  info(message: string): void;
  warning(message: string | Error): void;
  error(message: string | Error): void;
  debug(message: string): void;
}
