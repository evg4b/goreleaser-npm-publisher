import {
  createProject,
  type ExecResult,
  fixtureTargets,
  getManifest,
  getPackument,
  type GoreleaserProject,
  integrationEnvironment,
  targetPackageName,
} from '@integration/support';

describe('publish command', () => {
  const packageName = 'test-app-publish';

  const { registryUrl } = integrationEnvironment();
  let project: GoreleaserProject;
  let result: ExecResult;

  beforeAll(async () => {
    project = await createProject(packageName);
    result = await project.publish();
  });

  it('exits successfully', () => {
    expect({ code: result.code, output: result.stderr }).toEqual({ code: 0, output: '' });
  });

  it('reports the published main package', () => {
    expect(result.stdout).toContain(`Successfully published ${packageName}@${project.version}`);
  });

  it('publishes exactly one version of the main package', async () => {
    const packument = await getPackument(registryUrl, packageName);

    expect(Object.keys(packument.versions)).toEqual([project.version]);
    expect(packument['dist-tags'].latest).toBe(project.version);
  });

  it('publishes the main package with a bin pointing at the shim', async () => {
    const manifest = await getManifest(registryUrl, packageName, project.version);

    expect(manifest.bin).toEqual({ [packageName]: 'index.js' });
  });

  it('links every platform package as an optional dependency', async () => {
    const manifest = await getManifest(registryUrl, packageName, project.version);
    const expected = Object.fromEntries(
      fixtureTargets.map(target => [targetPackageName(packageName, target), project.version]),
    );

    expect(manifest.optionalDependencies).toEqual(expected);
  });

  it('declares every supported platform on the main package', async () => {
    const manifest = await getManifest(registryUrl, packageName, project.version);

    expect(manifest.os?.toSorted()).toEqual(['darwin', 'linux', 'win32']);
    expect(manifest.cpu?.toSorted()).toEqual(['arm64', 'ia32', 'x64']);
  });

  it.each(fixtureTargets)('publishes the $target package for its platform only', async target => {
    const targetPackage = targetPackageName(packageName, target);
    const manifest = await getManifest(registryUrl, targetPackage, project.version);

    expect(manifest).toMatchObject({
      version: project.version,
      os: [target.os],
      cpu: [target.cpu],
      bin: { [targetPackage]: target.bin },
    });
  });
});
