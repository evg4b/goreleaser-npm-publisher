import { isEmpty } from 'lodash';

export const transformPackage = (artifact: Artifact, metadata: Metadata): PackageDefinition => ({
  name: `${ metadata.project_name }_${ artifact.goos }_${ artifact.goarch }`,
  version: `v${ metadata.version }`,
  os: artifact.goos ?? '',
  cpu: artifact.goarch ?? '',
  bin: `${ artifact.extra.Binary ?? '' }${ artifact.extra.Ext ?? '' }`,
  sourceBinary: artifact.path,
  destinationBinary: artifact.path,
});

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
      [formatPackageName(pkg, prefix)]: `${ metadata.version }`,
    }), {}),
    os: packages.map((pkg) => pkg.os),
    cpu: packages.map((pkg) => pkg.cpu),
  };
};
