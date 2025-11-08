import { isEmpty, uniq } from 'lodash';
import { normalizeArch } from './arch';
import { FormatMainPackageJsonParams, FormatPackageJsonParams, TransformPackageParams, } from './models';
import { normalizeOS } from './os';

export const transformPackage = (params: TransformPackageParams): PackageDefinition => {
  const { artifact, metadata, files, keywords, license } = params;
  return {
    name: `${metadata.project_name}_${artifact.goos}_${artifact.goarch}`,
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
    os: [ pkg.os ],
    cpu: [ pkg.cpu ],
    files,
    keywords,
    license: pkg.license,
  });
};

export const formatPackageName = (pkg: PackageDefinition | Metadata, prefix: string | undefined): string => {
  if ('project_name' in pkg) {
    return isEmpty(prefix) ? pkg.project_name : `${prefix}/${pkg.project_name}`;
  }

  return isEmpty(prefix) ? pkg.name : `${prefix}/${pkg.name}`;
};

export const formatMainPackageJson = (params: FormatMainPackageJsonParams): PackageJson => {
  const { packages, metadata, description, prefix, files, keywords, license } = params;
  return normalize({
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
    license: license,
  });
};

const normalize = ({ description, ...other }: PackageJson): PackageJson => {
  if (description) {
    return { ...other, description };
  }

  return other;
};
