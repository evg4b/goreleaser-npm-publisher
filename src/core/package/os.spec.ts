import { normalizeOS } from './os';

describe('os', () => {
  describe('should normalize os', () => {
    const testCases: { input: GOOS; expected: OS }[] = [
      { input: 'darwin', expected: 'darwin' },
      { input: 'linux', expected: 'linux' },
      { input: 'windows', expected: 'win32' },
      { input: 'android', expected: 'android' },
      { input: 'aix', expected: 'aix' },
      { input: 'freebsd', expected: 'freebsd' },
      { input: 'openbsd', expected: 'openbsd' },
      { input: 'solaris', expected: 'sunos' },
      { input: 'netbsd', expected: 'netbsd' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should transform ${input} to ${expected}`, () => {
        expect(normalizeOS(input)).toEqual(expected);
      });
    });
  });

  describe('should throw error', () => {
    const testCases: GOOS[] = ['dragonfly', 'hurd', 'illumos', 'ios', 'js', 'nacl', 'plan9', 'zos'];

    testCases.forEach(input => {
      it(`should throw error when os is ${input} and it is not supported`, () => {
        expect(() => normalizeOS(input)).toThrow(`${input} is not supported`);
      });
    });

    it('should throw error when os is unknown', () => {
      expect(() => normalizeOS('unknown' as unknown as GOOS)).toThrow('unknown is not supported');
    });
  });
});
