import {
  createGoreleaserProject,
  createNpmProject,
  currentFixtureTarget,
  foreignFixtureTarget,
  output,
  publishProject,
  targetPackageName,
  type ExecResult,
  type GoreleaserProject,
  type NpmProject,
} from '@integration/support';

const packageName = 'test-app-install';
// `tests/test-app` greets through Go's builtin `println`, which writes to stderr.
const expectedGreeting = 'Ba dum, tss!';

describe('installing a published package', () => {
  const currentTarget = currentFixtureTarget();
  const foreignTarget = foreignFixtureTarget();
  let project: GoreleaserProject;
  let consumer: NpmProject;
  let installation: ExecResult;

  beforeAll(async () => {
    project = await createGoreleaserProject(packageName);
    const publication = await publishProject(project);
    if (publication.code !== 0) {
      throw new Error(`Publishing the fixture failed:\n${publication.stdout}\n${publication.stderr}`);
    }

    consumer = await createNpmProject('consumer');
    installation = await consumer.install(`${packageName}@${project.version}`);
  });

  it('installs without errors', () => {
    expect(installation.code).toBe(0);
  });

  it('installs the main package', async () => {
    const manifest = await consumer.installedManifest(packageName);

    expect(manifest?.version).toBe(project.version);
  });

  it('installs the platform package of the current machine', async () => {
    const manifest = await consumer.installedManifest(targetPackageName(packageName, currentTarget));

    expect(manifest?.version).toBe(project.version);
  });

  it('skips platform packages of other operating systems', async () => {
    const manifest = await consumer.installedManifest(targetPackageName(packageName, foreignTarget));

    expect(manifest).toBeUndefined();
  });

  it('runs the goreleaser binary through the installed command', async () => {
    const execution = await consumer.run(packageName);

    expect({ code: execution.code, output: output(execution).trim() }).toEqual({ code: 0, output: expectedGreeting });
  });

  it('forwards arguments and the exit code of the binary', async () => {
    const execution = await consumer.run(packageName, ['--any-argument']);

    expect(execution.code).toBe(0);
  });
});
