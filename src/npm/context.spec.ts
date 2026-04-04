const writeFileMock = jest.fn();
const rmMock = jest.fn();

jest.mock('../helpers/fs', () => ({
  writeFile: writeFileMock,
  rm: rmMock,
}));

const debugMock = jest.fn();
jest.mock('../core/logger', () => ({
  logger: { debug: debugMock },
}));

import { execInContext } from './context';

describe('execInContext', () => {
  describe('without token', () => {
    it('should call action with process env', async () => {
      const action = jest.fn().mockResolvedValue('result');

      const result = await execInContext({}, action);

      expect(action).toHaveBeenCalledWith(expect.objectContaining(process.env));
      expect(result).toBe('result');
    });

    it('should not write .npmrc file', async () => {
      const action = jest.fn().mockResolvedValue('result');

      await execInContext({}, action);

      expect(writeFileMock).not.toHaveBeenCalled();
    });
  });

  describe('with token', () => {
    beforeEach(() => {
      writeFileMock.mockResolvedValue(undefined);
      rmMock.mockResolvedValue(undefined);
    });

    it('should call action with NPM_TOKEN in env', async () => {
      const action = jest.fn().mockResolvedValue('result');

      await execInContext({ token: 'my-token' }, action);

      expect(action).toHaveBeenCalledWith(expect.objectContaining({ NPM_TOKEN: 'my-token' }));
    });

    it('should write .npmrc file before calling action', async () => {
      const action = jest.fn().mockResolvedValue('result');

      await execInContext({ token: 'my-token', pwd: '/tmp/project' }, action);

      expect(writeFileMock).toHaveBeenCalledWith(
        '/tmp/project/.npmrc',
        expect.stringContaining('my-token'),
      );
    });

    it('should remove .npmrc file after action completes', async () => {
      const action = jest.fn().mockResolvedValue('result');

      await execInContext({ token: 'my-token', pwd: '/tmp/project' }, action);

      expect(rmMock).toHaveBeenCalledWith('/tmp/project/.npmrc', { force: true });
    });

    it('should remove .npmrc even when action throws', async () => {
      const action = jest.fn().mockRejectedValue(new Error('action failed'));

      await expect(execInContext({ token: 'my-token', pwd: '/tmp/project' }, action)).rejects.toThrow('action failed');

      expect(rmMock).toHaveBeenCalledWith('/tmp/project/.npmrc', { force: true });
    });

    it('should return action result', async () => {
      const action = jest.fn().mockResolvedValue(42);

      const result = await execInContext({ token: 'secret' }, action);

      expect(result).toBe(42);
    });
  });
});
