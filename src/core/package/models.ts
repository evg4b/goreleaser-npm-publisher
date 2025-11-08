
export interface TransformPackageParams {
  artifact: BinaryArtifact;
  metadata: Metadata;
  files: string[];
  keywords: string[];
  license?: string;
}

export interface FormatPackageJsonParams {
  pkg: PackageDefinition;
  description: string | undefined;
  prefix: string | undefined;
  files: string[];
  keywords: string[];
}

export interface FormatMainPackageJsonParams {
  packages: PackageDefinition[];
  metadata: Metadata;
  description: string | undefined;
  prefix: string | undefined;
  files: string[];
  keywords: string[];
  license?: string;
}
