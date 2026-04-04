import { ConsoleLogger } from './console';

const makeConsole = () => ({
  group: jest.fn(),
  groupEnd: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

describe('ConsoleLogger', () => {
  describe('info', () => {
    it('should call console.log', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      logger.info('hello');

      expect(con.log).toHaveBeenCalledWith('hello');
    });
  });

  describe('warning', () => {
    it('should call console.warn with yellow-wrapped message', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      logger.warning('oops');

      expect(con.warn).toHaveBeenCalledWith(expect.stringContaining('oops'));
    });

    it('should accept an Error object', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      logger.warning(new Error('bad thing'));

      expect(con.warn).toHaveBeenCalledWith(expect.stringContaining('bad thing'));
    });
  });

  describe('error', () => {
    it('should call console.error', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      logger.error('something went wrong');

      expect(con.error).toHaveBeenCalledWith('something went wrong');
    });
  });

  describe('debug', () => {
    it('should call console.debug when verbose is true', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, true);

      logger.debug('verbose info');

      expect(con.debug).toHaveBeenCalledWith('verbose info');
    });

    it('should not call console.debug when verbose is false', () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      logger.debug('verbose info');

      expect(con.debug).not.toHaveBeenCalled();
    });
  });

  describe('group', () => {
    it('should call console.group and groupEnd around fn', async () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      const result = await logger.group('my-group', () => Promise.resolve('done'));

      expect(con.group).toHaveBeenCalledWith('my-group');
      expect(con.groupEnd).toHaveBeenCalled();
      expect(result).toBe('done');
    });

    it('should call groupEnd even when fn throws', async () => {
      const con = makeConsole();
      const logger = new ConsoleLogger(con as unknown as typeof console, false);

      await expect(
        logger.group('my-group', async () => Promise.reject(new Error('boom'))),
      ).rejects.toThrow('boom');

      expect(con.groupEnd).toHaveBeenCalled();
    });
  });
});
