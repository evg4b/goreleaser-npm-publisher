export class ProcessExited extends Error {
  constructor(public readonly code: number) {
    super(`process.exit(${code})`);
  }
}

let spy: jest.SpyInstance | undefined;

/** `process.exit` never returns, so the mock leaves the caller through an exception instead. */
export const mockExit = (): jest.SpyInstance => {
  spy = jest.spyOn(process, 'exit').mockImplementation(code => {
    throw new ProcessExited(Number(code ?? 0));
  });

  return spy;
};

afterEach(() => {
  spy?.mockRestore();
  spy = undefined;
});
