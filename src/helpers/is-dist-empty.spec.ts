import { isDistEmptyCheck } from './is-dist-empty';

describe('isDistEmpty', () => {
  describe('dist folder is empty', () => {
    it('should return true', async () => {
      const result = await isDistEmptyCheck({ project: '/project', clear: false });
      expect(result).toBe(true);
    });
  });

  describe('passed --clear flag', () => {
    it('should return true always', async () => {
      const result = await isDistEmptyCheck({
        project: 'project',
        clear: true,
      });
      expect(result).toBe(true);
    });
  });
});
