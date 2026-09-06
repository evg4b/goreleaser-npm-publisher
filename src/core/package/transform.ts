import { uniq } from 'es-toolkit/array';
import { normalizeArch } from './arch';
import { FormatMainPackageJsonParams, FormatPackageJsonParams, TransformPackageParams } from './models';
import { normalizeOS } from './os';
import { formatRepository } from './repository';

export const transformPackage = (params: TransformPackageParams): PackageDefinition => {
  const { artifact, metadata, name, files, keywords, license } = params;
  return {
    name: `${name ?? metadata.project_name}_${artifact.goos}_${artifact.goarch}`,
    version: metadata.version,
    os: normalizeOS(artifact.goos),
    cpu: normalizeArch(artifact.goarch),
    bin: `${artifact.extra.Binary}${artifact.extra.Ext}`,
    sourceBinary: artifact.path,
    destinationBinary: artifact.path,
    files,
    keywords,
    license,
  };
};

export const formatPackageJson = (params: FormatPackageJsonParams): PackageJson => {
  const { pkg, description, prefix, files, keywords } = params;
  return normalize({
    name: formatPackageName(pkg, prefix),
    description,
    version: pkg.version,
    bin: { [pkg.name]: pkg.bin },
    os: [pkg.os],
    cpu: [pkg.cpu],
    files,
    keywords,
    license: pkg.license,
    repository: formatRepository(params),
  });
};

export const formatPackageName = (pkg: PackageDefinition | Metadata, prefix: string | undefined): string => {
  if ('project_name' in pkg) {
    return prefix?.length
      ? `${prefix}/${pkg.project_name}`
      : pkg.project_name;
  }

  return prefix?.length
    ? `${prefix}/${pkg.name}`
    : pkg.name;
};

export const formatMainPackageJson = (params: FormatMainPackageJsonParams): PackageJson => {
  const { packages, metadata, name, bin, description, prefix, files, keywords, license } = params;
  const packageName = name ?? metadata.project_name;
  return normalize({
    name: prefix?.length
      ? `${prefix}/${packageName}`
      : packageName,
    description,
    version: metadata.version,
    bin: { [bin ?? packageName]: 'index.js' },
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
    license: license,
    repository: formatRepository(params),
  });
};

const normalize = ({ description, repository, ...other }: PackageJson): PackageJson => {
  return {
    ...other,
    ...(description ? { description } : {}),
    ...(repository ? { repository } : {}),
  };
};
