import { isEmpty, uniq } from 'lodash';

const platformMapping: Partial<Record<GOOS, OS>> = {
  'darwin': 'darwin',
  'linux': 'linux',
  'windows': 'win32',
  'android': 'android',
  'aix': 'aix',
  'freebsd': 'freebsd',
  'openbsd': 'openbsd',
  'solaris': 'sunos',
  'netbsd': 'netbsd',
};

const normalizeOS = (goos: GOOS): OS => {
  const normalized = platformMapping[goos];
  if (!normalized) {
    throw new Error(`${ goos } is not supported`);
  }

  return normalized;
};

const archMapping: Partial<Record<GOARCH, CPU>> = {
  'amd64': 'x64',
  '386': 'ia32',
  'arm': 'arm',
  'arm64': 'arm64',
  's390x': 's390x',
  's390': 's390',
  'riscv64': 'riscv64',
  'ppc64': 'ppc64',
  'ppc': 'ppc',
  'mips': 'mips',
};

const normalizeCPU = (goarch: GOARCH): CPU => {
  const normalized = archMapping[goarch];
  if (!normalized) {
    throw new Error(`${ goarch } is not supported`);
  }

  return normalized;
};

export const transformPackage = (artifact: BinaryArtifact, metadata: Metadata): PackageDefinition => {
  return ({
    name: `${ metadata.project_name }_${ artifact.goos }_${ artifact.goarch }`,
    version: `v${ metadata.version }`,
    os: normalizeOS(artifact.goos),
    cpu: normalizeCPU(artifact.goarch),
    bin: `${ artifact.extra.Binary }${ artifact.extra.Ext }`,
    sourceBinary: artifact.path,
    destinationBinary: artifact.path,
  });
};

export const formatPackageJson = (pkg: PackageDefinition, prefix: string | undefined): PackageJson => ({
  name: formatPackageName(pkg, prefix),
  description: 'TODO',
  version: pkg.version,
  bin: pkg.bin,
  os: [pkg.os],
  cpu: [pkg.cpu],
});

export const formatPackageName = (pkg: PackageDefinition, prefix: string | undefined): string => {
  return isEmpty(prefix) ? pkg.name : `${ prefix }/${ pkg.name }`;
};

export const formatMainPackageJson = (
  packages: PackageDefinition[],
  metadata: Metadata,
  prefix: string | undefined,
): PackageJson => {
  return {
    name: isEmpty(prefix) ? metadata.project_name : `${ prefix }/${ metadata.project_name }`,
    description: 'TODO',
    version: `v${ metadata.version }`,
    bin: 'index.js',
    optionalDependencies: packages.reduce<Record<string, string>>((acc, pkg) => ({
      ...acc,
      [formatPackageName(pkg, prefix)]: metadata.version,
    }), {}),
    os: uniq(packages.map((pkg) => pkg.os)),
    cpu: uniq(packages.map((pkg) => pkg.cpu)),
  };
};
