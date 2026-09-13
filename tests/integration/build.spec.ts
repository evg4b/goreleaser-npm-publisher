import { createProject, fixtureTargets, type GoreleaserProject } from '@integration/support';

describe('build command', () => {
  const packageName = 'test-app-build';
  const mainPackage = packageName;
  const platformPackage = 'test-app-linux-amd-64-v-1';

  const buildFixture = async (args: string[] = []): Promise<GoreleaserProject> => {
    const project = await createProject(packageName);
    const result = await project.build(args);
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
      expect(await project.packages()).toHaveLength(fixtureTargets.length + 1);
    });

    it('names the main package after the project', async () => {
      const manifest = await project.manifest(mainPackage);

      expect(manifest.name).toBe(packageName);
      expect(manifest.version).toBe(project.version);
    });

    it('installs the main package as a command backed by the shim', async () => {
      const manifest = await project.manifest(mainPackage);

      expect(manifest.bin).toEqual({ [packageName]: 'index.js' });
      expect(await project.file(mainPackage, 'index.js')).toContain('#!/usr/bin/env node');
    });

    it('depends on every platform package', async () => {
      const manifest = await project.manifest(mainPackage);

      expect(Object.keys(manifest.optionalDependencies ?? {})).toHaveLength(fixtureTargets.length);
    });

    it('ships the goreleaser binary in the platform package', async () => {
      const manifest = await project.manifest(platformPackage);

      expect(manifest.bin).toEqual({ [`${packageName}_linux_amd64`]: 'test-app' });
      expect(await project.file(platformPackage, 'test-app')).not.toBe('');
    });

    it('leaves out the fields that were not asked for', async () => {
      const manifest = await project.manifest(mainPackage);

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
      const manifest = await project.manifest(mainPackage);

      expect(manifest.name).toBe(`@scope/${packageName}`);
      expect(Object.keys(manifest.optionalDependencies ?? {})).toContain(`@scope/${packageName}_linux_amd64`);
    });

    it('scopes the platform packages', async () => {
      const manifest = await project.manifest(platformPackage);

      expect(manifest.name).toBe(`@scope/${packageName}_linux_amd64`);
    });

    it('names the installed command after --bin', async () => {
      const manifest = await project.manifest(mainPackage);

      expect(manifest.bin).toEqual({ 'custom-command': 'index.js' });
    });

    it('carries the description, license and keywords', async () => {
      const manifest = await project.manifest(mainPackage);

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

      const manifest = await project.manifest(mainPackage);

      expect(manifest.repository).toEqual({
        type: 'git',
        url: 'https://github.com/evg4b/test-app',
        directory: 'packages/cli',
      });
    });

    it('takes the repository type it is given over the detected one', async () => {
      const project = await buildFixture(['--repository', 'https://example.com/test-app', '--repository-type', 'svn']);

      const manifest = await project.manifest(mainPackage);

      expect(manifest.repository?.type).toBe('svn');
    });

    it('rejects a repository type npm does not know', async () => {
      const project = await createProject(packageName);

      const result = await project.build(['--repository', 'https://example.com', '--repository-type', 'cvs']);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('cvs');
    });
  });

  describe('with extra files', () => {
    it('copies the files matching the globs into every package', async () => {
      const project = await createProject(packageName);
      await project.addFile('README.md', '# test-app');
      await project.addFile('LICENSE', 'MIT');

      const result = await project.build(['--files', 'readme.md', 'license']);

      expect(result.code).toBe(0);
      expect((await project.file(mainPackage, 'README.md')).trim()).toBe('# test-app');
      expect((await project.file(platformPackage, 'LICENSE')).trim()).toBe('MIT');
      const files = (await project.manifest(mainPackage)).files.map(file => file.toLowerCase());
      expect(files.toSorted()).toEqual(['license', 'readme.md']);
    });
  });

  describe('with a dist folder that is not empty', () => {
    it('refuses to build over a previous build', async () => {
      const project = await buildFixture();

      const result = await project.build();

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('--clear');
    });

    it('builds again when told to clear it', async () => {
      const project = await buildFixture();

      const result = await project.build(['--clear']);

      expect(result.code).toBe(0);
      expect(await project.packages()).toHaveLength(fixtureTargets.length + 1);
    });
  });
});
