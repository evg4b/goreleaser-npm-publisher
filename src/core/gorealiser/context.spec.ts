import '@mocks/process';

import { cwd } from 'node:process';
import { Context } from './context';

jest.mocked(cwd).mockReturnValue('/usr/test/desktop/project1');

describe('context', () => {
  describe.each([
    ['an absolute path', '/usr/src/app', '/usr/src/app'],
    ['a relative path', '.', '/usr/test/desktop/project1'],
  ])('for %s', (_label, input, base) => {
    let context: Context;

    beforeEach(() => (context = new Context(input)));

    it('should return the artifacts path', () => {
      expect(context.artifactsPath).toBe(`${base}/dist/artifacts.json`);
    });

    it('should return the metadata path', () => {
      expect(context.metadataPath).toBe(`${base}/dist/metadata.json`);
    });

    it('should return the dist path', () => {
      expect(context.distPath).toBe(`${base}/dist/npm`);
    });

    it('should return the package folder', () => {
      expect(context.packageFolder('my-package')).toBe(`${base}/dist/npm/my-package`);
    });

    it('should return the package json', () => {
      expect(context.packageJson('my-package')).toBe(`${base}/dist/npm/my-package/package.json`);
    });

    it('should return the package folder with subfolders', () => {
      expect(context.packageFolder('my-package', 'subfolder')).toBe(`${base}/dist/npm/my-package/subfolder`);
    });

    it('should return the package folder with subfolders and a leading slash', () => {
      expect(context.packageFolder('/my-package', 'subfolder')).toBe(`${base}/dist/npm/my-package/subfolder`);
    });
  });

  describe('project()', () => {
    let context: Context;

    beforeEach(() => (context = new Context('/usr/src/app')));

    it('should return the project root when called with no parts', () => {
      expect(context.project()).toBe('/usr/src/app');
    });

    it('should join parts to the project root', () => {
      expect(context.project('src', 'main.go')).toBe('/usr/src/app/src/main.go');
    });
  });
});
