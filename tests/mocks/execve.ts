type Execve = NonNullable<typeof process.execve>;

const original = Object.getOwnPropertyDescriptor(process, 'execve');

const define = (value: Execve | undefined): void => {
  Object.defineProperty(process, 'execve', { value, configurable: true, enumerable: true, writable: true });
};

export const mockExecve = (): jest.MockedFunction<Execve> => {
  const execve = jest.fn().mockName('execve') as unknown as jest.MockedFunction<Execve>;
  define(execve);

  return execve;
};

export const withoutExecve = (): void => define(undefined);

afterEach(() => {
  if (original) {
    Object.defineProperty(process, 'execve', original);
  } else {
    Reflect.deleteProperty(process, 'execve');
  }
});
