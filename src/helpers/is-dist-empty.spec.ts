import '@mocks/fs-promises';
import '@mocks/process';

import { readdir, stat } from 'node:fs/promises';
import { isDistEmptyCheck } from './is-dist-empty';

describe('isDistEmpty', () => {
  describe('passed --clear flag', () => {
    it('should return true without checking filesystem', async () => {
      const result = await isDistEmptyCheck({ project: '.', clear: true });

      expect(result).toBe(true);
      expect(jest.mocked(stat) as unknown as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe('dist folder does not exist (ENOENT)', () => {
    it('should return true', async () => {
      (jest.mocked(stat) as unknown as jest.Mock).mockRejectedValue(
        Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
      );

      const result = await isDistEmptyCheck({ project: '.', clear: false });

      expect(result).toBe(true);
    });
  });

  describe('dist folder exists and is a directory', () => {
    beforeEach(() => {
      (jest.mocked(stat) as unknown as jest.Mock).mockResolvedValue({ isDirectory: () => true });
    });

    it('should return true when folder is empty', async () => {
      (jest.mocked(readdir) as unknown as jest.Mock).mockResolvedValue([]);

      const result = await isDistEmptyCheck({ project: '.', clear: false });

      expect(result).toBe(true);
    });

    it('should return an error when folder has contents', async () => {
      (jest.mocked(readdir) as unknown as jest.Mock).mockResolvedValue(['some-package']);

      const result = await isDistEmptyCheck({ project: '.', clear: false });

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('not empty');
    });
  });

  describe('dist path is not a directory', () => {
    it('should return an error', async () => {
      (jest.mocked(stat) as unknown as jest.Mock).mockResolvedValue({ isDirectory: () => false });

      const result = await isDistEmptyCheck({ project: '.', clear: false });

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toContain('not a directory');
    });
  });

  describe('unexpected stat error', () => {
    it('should rethrow the error', async () => {
      (jest.mocked(stat) as unknown as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(isDistEmptyCheck({ project: '.', clear: false })).rejects.toThrow('Permission denied');
    });
  });
});
