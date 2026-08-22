import { RepositoryParams } from './models';

export const repositoryTypes: RepositoryType[] = ['git', 'svn', 'hg', 'bzr'];

export const defaultRepositoryType: RepositoryType = 'git';

export const formatRepository = (params: RepositoryParams): PackageRepository | undefined => {
  const url = params.repository?.trim();
  if (!url) {
    return undefined;
  }

  const directory = params.repositoryDirectory?.trim();

  return {
    type: params.repositoryType ?? detectRepositoryType(url),
    url,
    ...(directory ? { directory } : {}),
  };
};

export const pickRepositoryParams = (params: RepositoryParams): RepositoryParams => ({
  repository: params.repository,
  repositoryType: params.repositoryType,
  repositoryDirectory: params.repositoryDirectory,
});

const detectRepositoryType = (url: string): RepositoryType => {
  const [scheme] = url.split('://');
  const [type] = scheme.toLowerCase().split('+');

  return repositoryTypes.includes(type as RepositoryType) ? (type as RepositoryType) : defaultRepositoryType;
};
