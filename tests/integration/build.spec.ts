import { buildProject, createGoreleaserProject, fixtureTargets, type GoreleaserProject } from '@integration/support';

describe('build command', () => {
  const packageName = 'test-app-build';
  const mainPackage = packageName;
  // Platform folders keep the goreleaser target, kebab-cased; only the main package follows --name.
  const platformPackage = 'test-app-linux-amd-64-v-1';

  const buildFixture = async (args: string[] = []): Promise<GoreleaserProject> => {
    const project = await createGoreleaserProject(packageName);
    const result = await buildProject(project, args);
    if (result.code !== 0) {
      throw new Error(`Building the fixture failed:\n${result.stdout}\n${result.stderr}`);
    }

    return project;
  };

  describe('with no options beyond the project', () => {
    let project: GoreleaserProject;

    beforeAll(async () => {
      project = await buildFixture();
    });

    it('writes one package per target plus the main package', async () => {
      expect(await project.builtPackages()).toHaveLength(fixtureTargets.length + 1);
    });

    it('names the main package after the project', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.name).toBe(packageName);
      expect(manifest.version).toBe(project.version);
    });

    it('installs the main package as a command backed by the shim', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.bin).toEqual({ [packageName]: 'index.js' });
      expect(await project.builtFile(mainPackage, 'index.js')).toContain('#!/usr/bin/env node');
    });

    it('depends on every platform package', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(Object.keys(manifest.optionalDependencies ?? {})).toHaveLength(fixtureTargets.length);
    });

    it('ships the goreleaser binary in the platform package', async () => {
      const manifest = await project.builtManifest(platformPackage);

      expect(manifest.bin).toEqual({ [`${packageName}_linux_amd64`]: 'test-app' });
      expect(await project.builtFile(platformPackage, 'test-app')).not.toBe('');
    });

    it('leaves out the fields that were not asked for', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.description).toBeUndefined();
      expect(manifest.repository).toBeUndefined();
      expect(manifest.license).toBeUndefined();
    });
  });

  describe('with the package options', () => {
    let project: GoreleaserProject;

    beforeAll(async () => {
      project = await buildFixture([
        '--prefix',
        '@scope',
        '--bin',
        'custom-command',
        '--description',
        'A packaged goreleaser binary',
        '--license',
        'MIT',
        '--keywords',
        'cli',
        'golang',
      ]);
    });

    it('scopes the main package and its dependencies', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.name).toBe(`@scope/${packageName}`);
      expect(Object.keys(manifest.optionalDependencies ?? {})).toContain(`@scope/${packageName}_linux_amd64`);
    });

    it('scopes the platform packages', async () => {
      const manifest = await project.builtManifest(platformPackage);

      expect(manifest.name).toBe(`@scope/${packageName}_linux_amd64`);
    });

    it('names the installed command after --bin', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.bin).toEqual({ 'custom-command': 'index.js' });
    });

    it('carries the description, license and keywords', async () => {
      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.description).toBe('A packaged goreleaser binary');
      expect(manifest.license).toBe('MIT');
      expect(manifest.keywords).toEqual(['cli', 'golang']);
    });
  });

  describe('with the repository options', () => {
    it('records the repository the packages are built from', async () => {
      const project = await buildFixture([
        '--repository',
        'https://github.com/evg4b/test-app',
        '--repository-directory',
        'packages/cli',
      ]);

      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.repository).toEqual({
        type: 'git',
        url: 'https://github.com/evg4b/test-app',
        directory: 'packages/cli',
      });
    });

    it('takes the repository type it is given over the detected one', async () => {
      const project = await buildFixture(['--repository', 'https://example.com/test-app', '--repository-type', 'svn']);

      const manifest = await project.builtManifest(mainPackage);

      expect(manifest.repository?.type).toBe('svn');
    });

    it('rejects a repository type npm does not know', async () => {
      const project = await createGoreleaserProject(packageName);

      const result = await buildProject(project, ['--repository', 'https://example.com', '--repository-type', 'cvs']);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('cvs');
    });
  });

  describe('with extra files', () => {
    it('copies the files matching the globs into every package', async () => {
      const project = await createGoreleaserProject(packageName);
      await project.addFile('README.md', '# test-app');
      await project.addFile('LICENSE', 'MIT');

      const result = await buildProject(project, ['--files', 'readme.md', 'license']);

      expect(result.code).toBe(0);
      expect((await project.builtFile(mainPackage, 'README.md')).trim()).toBe('# test-app');
      expect((await project.builtFile(platformPackage, 'LICENSE')).trim()).toBe('MIT');
      // Case follows the glob or the filesystem entry, depending on how the platform matches.
      const files = (await project.builtManifest(mainPackage)).files.map(file => file.toLowerCase());
      expect(files.toSorted()).toEqual(['license', 'readme.md']);
    });
  });

  describe('with a dist folder that is not empty', () => {
    it('refuses to build over a previous build', async () => {
      const project = await buildFixture();

      const result = await buildProject(project);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('--clear');
    });

    it('builds again when told to clear it', async () => {
      const project = await buildFixture();

      const result = await buildProject(project, ['--clear']);

      expect(result.code).toBe(0);
      expect(await project.builtPackages()).toHaveLength(fixtureTargets.length + 1);
    });
  });
});
