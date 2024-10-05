import { Context } from './context';

jest.mock('node:process', () => ({
  cwd: () => '/usr/test/desktop/project1',
}));

describe('context', () => {
  let context: Context;

  describe('for absolute path', () => {
    beforeEach(() => (context = new Context('/usr/src/app')));

    it('should return the artifacts path', () => {
      expect(context.artifactsPath).toBe('/usr/src/app/dist/artifacts.json');
    });

    it('should return the metadata path', () => {
      expect(context.metadataPath).toBe('/usr/src/app/dist/metadata.json');
    });

    it('should return the dist path', () => {
      expect(context.distPath).toBe('/usr/src/app/dist/npm');
    });

    it('should return the package folder', () => {
      expect(context.packageFolder('my-package')).toBe('/usr/src/app/dist/npm/my-package');
    });

    it('should return the package json', () => {
      expect(context.packageJson('my-package')).toBe('/usr/src/app/dist/npm/my-package/package.json');
    });

    it('should return the package folder with subfolders', () => {
      expect(context.packageFolder('my-package', 'subfolder')).toBe('/usr/src/app/dist/npm/my-package/subfolder');
    });

    it('should return the package folder with subfolders and a leading slash', () => {
      expect(context.packageFolder('/my-package', 'subfolder')).toBe('/usr/src/app/dist/npm/my-package/subfolder');
    });
  });

  describe('for absolute path', () => {
    beforeEach(() => (context = new Context('.')));

    it('should return the artifacts path', () => {
      expect(context.artifactsPath).toBe('/usr/test/desktop/project1/dist/artifacts.json');
    });

    it('should return the metadata path', () => {
      expect(context.metadataPath).toBe('/usr/test/desktop/project1/dist/metadata.json');
    });

    it('should return the dist path', () => {
      expect(context.distPath).toBe('/usr/test/desktop/project1/dist/npm');
    });

    it('should return the package folder', () => {
      expect(context.packageFolder('my-package')).toBe('/usr/test/desktop/project1/dist/npm/my-package');
    });

    it('should return the package json', () => {
      expect(context.packageJson('my-package')).toBe('/usr/test/desktop/project1/dist/npm/my-package/package.json');
    });

    it('should return the package folder with subfolders', () => {
      expect(context.packageFolder('my-package', 'subfolder')).toBe(
        '/usr/test/desktop/project1/dist/npm/my-package/subfolder',
      );
    });

    it('should return the package folder with subfolders and a leading slash', () => {
      expect(context.packageFolder('/my-package', 'subfolder')).toBe(
        '/usr/test/desktop/project1/dist/npm/my-package/subfolder',
      );
    });
  });
});
