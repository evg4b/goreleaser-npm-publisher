import { logger, setLogger } from './state';
import { Logger } from './logger';

describe('setLogger', () => {
  it('should replace the logger', () => {
    const newLogger: Logger = {
      group: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    setLogger(newLogger);

    expect(logger).toBe(newLogger);
  });
});
