import { defaultRepositoryType, formatRepository, pickRepositoryParams, repositoryTypes } from './repository';

describe('formatRepository', () => {
  it('should return undefined when the repository url is not provided', () => {
    expect(formatRepository({})).toBeUndefined();
  });

  it('should return undefined when the repository url is blank', () => {
    expect(formatRepository({ repository: '   ' })).toBeUndefined();
  });

  it('should use git as the default type', () => {
    const result = formatRepository({ repository: 'https://github.com/scope/myapp.git' });

    expect(result).toEqual({ type: 'git', url: 'https://github.com/scope/myapp.git' });
  });

  it('should use the explicitly provided type', () => {
    const result = formatRepository({ repository: 'https://svn.example.com/myapp', repositoryType: 'svn' });

    expect(result).toEqual({ type: 'svn', url: 'https://svn.example.com/myapp' });
  });

  it.each<[string, RepositoryType]>([
    ['git+https://github.com/scope/myapp.git', 'git'],
    ['git+ssh://git@github.com/scope/myapp.git', 'git'],
    ['svn+https://svn.example.com/myapp', 'svn'],
    ['hg+https://hg.example.com/myapp', 'hg'],
    ['bzr+ssh://bzr.example.com/myapp', 'bzr'],
    ['SVN+HTTPS://svn.example.com/myapp', 'svn'],
  ])('should detect the type of %s as %s', (url, type) => {
    expect(formatRepository({ repository: url })).toEqual({ type, url });
  });

  it.each(['https://github.com/scope/myapp.git', 'git@github.com:scope/myapp.git', 'ftp://example.com/myapp'])(
    'should fall back to the default type for %s',
    url => {
      expect(formatRepository({ repository: url })).toEqual({ type: defaultRepositoryType, url });
    },
  );

  it('should prefer the explicit type over the detected one', () => {
    const result = formatRepository({ repository: 'git+https://github.com/scope/myapp.git', repositoryType: 'hg' });

    expect(result).toEqual({ type: 'hg', url: 'git+https://github.com/scope/myapp.git' });
  });

  it('should include the directory when provided', () => {
    const result = formatRepository({
      repository: 'https://github.com/scope/myapp.git',
      repositoryDirectory: 'packages/cli',
    });

    expect(result).toEqual({
      type: 'git',
      url: 'https://github.com/scope/myapp.git',
      directory: 'packages/cli',
    });
  });

  it('should omit a blank directory', () => {
    const result = formatRepository({ repository: 'https://github.com/scope/myapp.git', repositoryDirectory: '  ' });

    expect(result).not.toHaveProperty('directory');
  });

  it('should trim the url and the directory', () => {
    const result = formatRepository({
      repository: '  https://github.com/scope/myapp.git  ',
      repositoryDirectory: '  packages/cli  ',
    });

    expect(result).toEqual({
      type: 'git',
      url: 'https://github.com/scope/myapp.git',
      directory: 'packages/cli',
    });
  });
});

describe('repositoryTypes', () => {
  it('should contain the npm supported repository types', () => {
    expect(repositoryTypes).toEqual(['git', 'svn', 'hg', 'bzr']);
  });

  it('should contain the default type', () => {
    expect(repositoryTypes).toContain(defaultRepositoryType);
  });
});

describe('pickRepositoryParams', () => {
  it('should pick only the repository related params', () => {
    const result = pickRepositoryParams({
      repository: 'https://github.com/scope/myapp.git',
      repositoryType: 'git',
      repositoryDirectory: 'packages/cli',
      prefix: '@scope',
    } as never);

    expect(result).toEqual({
      repository: 'https://github.com/scope/myapp.git',
      repositoryType: 'git',
      repositoryDirectory: 'packages/cli',
    });
  });

  it('should keep undefined values for missing params', () => {
    expect(pickRepositoryParams({})).toEqual({
      repository: undefined,
      repositoryType: undefined,
      repositoryDirectory: undefined,
    });
  });
});
