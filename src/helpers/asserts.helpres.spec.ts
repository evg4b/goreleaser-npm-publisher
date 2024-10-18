import { assertNotEmpty } from './asserts.helpres';

describe('assertNotEmpty', () => {
  describe('should throws for', () => {
    const cases = [
      { name: 'Empty string', input: '' },
      { name: 'Empty array', input: [] },
      { name: 'Null', input: null },
      { name: 'Undefined', input: undefined },
    ];

    it.each(cases)('$name', ({ input }) => {
      expect(() => assertNotEmpty(input)).toThrow();
    });
  });

  describe('should not throws for', () => {
    const cases = [
      { name: 'Not empty string', input: 'test' },
      { name: 'Not empty array', input: [{ name: 'test' }] },
    ];

    it.each(cases)('$name', ({ input }) => {
      expect(() => assertNotEmpty(input)).not.toThrow();
    });
  });
});
