import { isEmpty, uniq } from 'lodash';
import { normalizeArch } from './arch';
import { normalizeOS } from './os';

export const transformPackage = (artifact: BinaryArtifact, metadata: Metadata, files: string[], keywords: string[]): PackageDefinition => {
  return {
    name: `${metadata.project_name}_${artifact.goos}_${artifact.goarch}`,
    version: metadata.version,
    os: normalizeOS(artifact.goos),
    cpu: normalizeArch(artifact.goarch),
    bin: `${artifact.extra.Binary}${artifact.extra.Ext}`,
    sourceBinary: artifact.path,
    destinationBinary: artifact.path,
    files,
    keywords: keywords ?? [],
  };
};

export const formatPackageJson = (
  pkg: PackageDefinition,
  description: string | undefined,
  prefix: string | undefined,
  files: string[],
  keywords: string[],
): PackageJson =>
  normalize({
    name: formatPackageName(pkg, prefix),
    description,
    version: pkg.version,
    bin: { [pkg.name]: pkg.bin },
    os: [pkg.os],
    cpu: [pkg.cpu],
    files,
    keywords,
  });

export const formatPackageName = (pkg: PackageDefinition | Metadata, prefix: string | undefined): string => {
  if ('project_name' in pkg) {
    return isEmpty(prefix) ? pkg.project_name : `${prefix}/${pkg.project_name}`;
  }

  return isEmpty(prefix) ? pkg.name : `${prefix}/${pkg.name}`;
};

export const formatMainPackageJson = (
  packages: PackageDefinition[],
  metadata: Metadata,
  description: string | undefined,
  prefix: string | undefined,
  files: string[],
  keywords: string[],
): PackageJson =>
  normalize({
    name: formatPackageName(metadata, prefix),
    description,
    version: metadata.version,
    bin: { [metadata.project_name]: 'index.js' },
    optionalDependencies: packages.reduce<Record<string, string>>(
      (dependencies, pkg) => ({
        ...dependencies,
        [formatPackageName(pkg, prefix)]: metadata.version,
      }),
      {},
    ),
    os: uniq(packages.map(pkg => pkg.os)),
    cpu: uniq(packages.map(pkg => pkg.cpu)),
    files,
    keywords,
  });

const normalize = ({ description, ...other }: PackageJson): PackageJson => {
  if (description) {
    return { ...other, description };
  }

  return other;
};
