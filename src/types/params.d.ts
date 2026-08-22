interface ListParams {
  project: string;
  builder?: string;
  name?: string;
  bin?: string;
  repository?: string;
  repositoryType?: RepositoryType;
  repositoryDirectory?: string;
  description?: string;
  prefix?: string;
  verbose?: boolean;
  keywords?: string[];
}

interface BuildParams extends ListParams {
  clear: boolean;
  files: string[];
  license?: string;
}

interface PublishParams extends BuildParams {
  token?: string;
  otp?: string;
}
