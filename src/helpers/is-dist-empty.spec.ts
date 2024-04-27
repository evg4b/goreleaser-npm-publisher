import type { Arguments } from 'yargs';
import { isDistEmptyCheck } from './is-dist-empty';

describe('isDistEmpty', () => {
  beforeEach(() => {
    jest.mock('fs/promises');
  });

  describe('dist folder is empty', () => {
    it('should return true', async () => {
      const argv = { project: '/project' } as Arguments<DefaultParams>;
      const result = await isDistEmptyCheck(argv);
      expect(result).toBe(true);
    });
  });

  describe('passed --clear flag', () => {
    it('should return true always', async () => {
      const argv = { project: 'project', clear: true } as Arguments<DefaultParams>;
      const result = await isDistEmptyCheck(argv);
      expect(result).toBe(true);
    });
  });
});
