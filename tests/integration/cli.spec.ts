import { join } from 'node:path';
import {
  createGoreleaserProject,
  createSandbox,
  listProject,
  readJson,
  repositoryRoot,
  runPublisher,
  type GoreleaserProject,
} from '@integration/support';

describe('command line interface', () => {
  let project: GoreleaserProject;

  beforeAll(async () => {
    project = await createGoreleaserProject('test-app-cli');
  });

  it('asks for a command when invoked without arguments', async () => {
    const result = await runPublisher([]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('You need at least one command');
  });

  it('rejects an unknown command', async () => {
    const result = await runPublisher(['bogus']);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown command: bogus');
  });

  it('prints the version of the package', async () => {
    const manifest = await readJson<PackageJson>(join(repositoryRoot, 'package.json'));

    const result = await runPublisher(['--version']);

    expect({ code: result.code, version: result.stdout.trim() }).toEqual({ code: 0, version: manifest.version });
  });

  it('documents every command in the help', async () => {
    const result = await runPublisher(['--help']);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('list');
    expect(result.stdout).toContain('build');
    expect(result.stdout).toContain('publish');
  });

  it('reports the file it could not read when the project has no goreleaser output', async () => {
    const empty = await createSandbox('not-a-project');

    const result = await runPublisher(['build', '--project', empty]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('artifacts.json');
  });

  it('reports a builder that produced no binaries', async () => {
    const result = await runPublisher(['build', '--project', project.path, '--builder', 'missing-builder']);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('missing-builder');
  });

  describe('list', () => {
    it('describes the main package and every platform package', async () => {
      const result = await listProject(project);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain(`test-app@${project.version}`);
      expect(result.stdout).toContain(`test-app_linux_amd64@${project.version}`);
      expect(result.stdout).toContain('os: linux');
      expect(result.stdout).toContain('cpu: x64');
    });

    it('points at the binary each platform package would ship', async () => {
      const result = await listProject(project);

      expect(result.stdout).toContain(join(project.path, 'dist', 'test-app_linux_amd64_v1', 'test-app'));
    });

    it('applies the name and prefix the packages would be published under', async () => {
      const result = await listProject(project, ['--name', 'renamed', '--prefix', '@scope']);

      expect(result.stdout).toContain(`@scope/renamed@${project.version}`);
      expect(result.stdout).toContain(`@scope/renamed_darwin_arm64@${project.version}`);
    });

    it('writes nothing into the project', async () => {
      const untouched = await createGoreleaserProject('test-app-list');

      await listProject(untouched);

      await expect(untouched.builtPackages()).rejects.toThrow();
    });
  });
});
