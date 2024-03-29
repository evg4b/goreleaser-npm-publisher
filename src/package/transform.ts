import { isEmpty } from 'lodash';

export const transformPackage = (artifact: Artifact, metadata: Metadata): PackageDefinition => ({
  name: metadata.project_name,
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
