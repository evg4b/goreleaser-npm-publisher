let spies: jest.SpyInstance[] = [];

export const mockSignals = () => {
  const on = jest.spyOn(process, 'on').mockReturnValue(process);
  const kill = jest.spyOn(process, 'kill').mockReturnValue(true);
  const removeAllListeners = jest.spyOn(process, 'removeAllListeners').mockReturnValue(process);
  spies = [on, kill, removeAllListeners];

  const raise = (signal: NodeJS.Signals): void => {
    const handler = on.mock.calls.find(([event]) => event === signal)?.[1];
    if (!handler) {
      throw new Error(`No handler registered for ${signal}`);
    }

    handler(signal);
  };

  return { on, kill, removeAllListeners, raise };
};

afterEach(() => {
  spies.forEach(spy => spy.mockRestore());
  spies = [];
});
