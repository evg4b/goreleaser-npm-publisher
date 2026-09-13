import '@mocks/fs/promises';
import '@mocks/process';

import { readdir, stat } from 'node:fs/promises';
import { Stats } from 'node:fs';
import { assertDistIsEmpty } from './is-dist-empty';

describe('assertDistIsEmpty', () => {
  describe('passed --clear flag', () => {
    it('should pass without checking filesystem', async () => {
      await expect(assertDistIsEmpty({ project: '.', clear: true })).resolves.toBeUndefined();
      expect(stat).not.toHaveBeenCalled();
    });
  });

  describe('dist folder does not exist (ENOENT)', () => {
    it('should pass', async () => {
      jest.mocked(stat).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

      await expect(assertDistIsEmpty({ project: '.', clear: false })).resolves.toBeUndefined();
    });
  });

  describe('dist folder exists and is a directory', () => {
    beforeEach(() => {
      jest.mocked(stat).mockResolvedValue({ isDirectory: () => true } as unknown as Stats);
    });

    it('should pass when folder is empty', async () => {
      jest.mocked(readdir).mockResolvedValue([]);

      await expect(assertDistIsEmpty({ project: '.', clear: false })).resolves.toBeUndefined();
    });

    it('should throw when folder has contents', async () => {
      jest.mocked(readdir).mockResolvedValue(['some-package'] as unknown as Awaited<ReturnType<typeof readdir>>);

      await expect(assertDistIsEmpty({ project: '.', clear: false })).rejects.toThrow('not empty');
    });
  });

  describe('dist path is not a directory', () => {
    it('should throw', async () => {
      jest.mocked(stat).mockResolvedValue({ isDirectory: () => false } as unknown as Stats);

      await expect(assertDistIsEmpty({ project: '.', clear: false })).rejects.toThrow('not a directory');
    });
  });

  describe('unexpected stat error', () => {
    it('should rethrow the error', async () => {
      jest.mocked(stat).mockRejectedValue(new Error('Permission denied'));

      await expect(assertDistIsEmpty({ project: '.', clear: false })).rejects.toThrow('Permission denied');
    });
  });
});
