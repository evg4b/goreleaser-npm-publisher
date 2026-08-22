export interface TransformPackageParams {
  artifact: BinaryArtifact;
  metadata: Metadata;
  name?: string;
  files: string[];
  keywords: string[];
  license?: string;
}

export interface FormatPackageJsonParams {
  pkg: PackageDefinition;
  description: string | undefined;
  prefix: string | undefined;
  repository?: string;
  files: string[];
  keywords: string[];
}

export interface FormatMainPackageJsonParams {
  packages: PackageDefinition[];
  metadata: Metadata;
  name?: string;
  bin?: string;
  description: string | undefined;
  prefix: string | undefined;
  repository?: string;
  files: string[];
  keywords: string[];
  license?: string;
}
