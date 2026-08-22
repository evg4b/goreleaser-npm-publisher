export interface RepositoryParams {
  repository?: string;
  repositoryType?: RepositoryType;
  repositoryDirectory?: string;
}

export interface TransformPackageParams {
  artifact: BinaryArtifact;
  metadata: Metadata;
  name?: string;
  files: string[];
  keywords: string[];
  license?: string;
}

export interface FormatPackageJsonParams extends RepositoryParams {
  pkg: PackageDefinition;
  description: string | undefined;
  prefix: string | undefined;
  files: string[];
  keywords: string[];
}

export interface FormatMainPackageJsonParams extends RepositoryParams {
  packages: PackageDefinition[];
  metadata: Metadata;
  name?: string;
  bin?: string;
  description: string | undefined;
  prefix: string | undefined;
  files: string[];
  keywords: string[];
  license?: string;
}
