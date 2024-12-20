interface ListParams {
  project: string;
  builder?: string;
  description?: string;
  prefix?: string;
  verbose?: boolean;
  keywords?: string[];
}

interface BuildParams extends ListParams {
  clear: boolean;
  files: string[];
}

interface PublishParams extends BuildParams {
  token?: string;
}
