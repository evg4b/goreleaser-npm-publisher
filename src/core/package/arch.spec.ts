import { normalizeArch } from './arch';

describe('arch', () => {
  describe('should normalize arch', () => {
    const testCases: { input: GOARCH; expected: CPU; }[] = [
      { input: 'amd64', expected: 'x64' },
      { input: '386', expected: 'ia32' },
      { input: 'arm', expected: 'arm' },
      { input: 'arm64', expected: 'arm64' },
      { input: 's390x', expected: 's390x' },
      { input: 's390', expected: 's390' },
      { input: 'riscv64', expected: 'riscv64' },
      { input: 'ppc64', expected: 'ppc64' },
      { input: 'ppc', expected: 'ppc' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should transform ${ input } to ${ expected }`, () => {
        expect(normalizeArch(input)).toEqual(expected);
      });
    });
  });

  describe('should throw error', () => {
    const testCases: GOARCH[] = [
      'amd64p32',
      'arm64be',
      'armbe',
      'loong64',
      'mips64',
      'mips64le',
      'mips64p32',
      'mips64p32le',
      'mipsle',
      'ppc64le',
      'riscv',
      'sparc',
      'sparc64',
      'wasm',
    ];

    testCases.forEach(input => {
      it(`should throw error when os is ${ input } and it is not supported`, () => {
        expect(() => normalizeArch(input))
          .toThrow(`${ input } is not supported`);
      });
    });

    it('should throw error when arch is unknown', () => {
      expect(() => normalizeArch('unknown' as unknown as GOARCH))
        .toThrow('unknown is not supported');
    });
  });
});
