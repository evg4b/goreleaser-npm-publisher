import { isEmpty, uniq } from 'lodash';
import { normalizeArch } from './arch';
import { normalizeOS } from './os';

export const transformPackage = (artifact: BinaryArtifact, metadata: Metadata): PackageDefinition => {
  return ({
    name: `${ metadata.project_name }_${ artifact.goos }_${ artifact.goarch }`,
    version: `v${ metadata.version }`,
    os: normalizeOS(artifact.goos),
    cpu: normalizeArch(artifact.goarch),
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

export const formatPackageName = (pkg: PackageDefinition | Metadata, prefix: string | undefined): string => {
  if ('project_name' in pkg) {
    return isEmpty(prefix) ? pkg.project_name : `${ prefix }/${ pkg.project_name }`;
  }

  return isEmpty(prefix) ? pkg.name : `${ prefix }/${ pkg.name }`;
};

export const formatMainPackageJson = (
  packages: PackageDefinition[],
  metadata: Metadata,
  prefix: string | undefined,
): PackageJson => {
  return {
    name: formatPackageName(metadata, prefix),
    description: 'TODO',
    version: `v${ metadata.version }`,
    bin: 'index.js',
    optionalDependencies: packages.reduce<Record<string, string>>((dependencies, pkg) => ({
      ...dependencies,
      [formatPackageName(pkg, prefix)]: metadata.version,
    }), {}),
    os: uniq(packages.map((pkg) => pkg.os)),
    cpu: uniq(packages.map((pkg) => pkg.cpu)),
  };
};