/* eslint-disable @typescript-eslint/no-floating-promises */
const readFileMock = jest.fn();

jest.mock('node:fs/promises', () => ({
  readFile: readFileMock,
}));

import { parseArtifactsFile, validateBinaryArtifact } from './artifacts';

describe('parseArtifactsFile', () => {
  const artifactsContent = `[
    {
        "name": "metadata.json",
        "path": "dist/metadata.json",
        "internal_type": 30,
        "type": "Metadata"
    },
    {
        "name": "donkey.exe",
        "path": "dist/donkey_windows_amd64_v1/donkey.exe",
        "goos": "windows",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "windows_amd64_v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": ".exe",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey",
        "path": "dist/donkey_linux_386_sse2/donkey",
        "goos": "linux",
        "goarch": "386",
        "go386": "sse2",
        "target": "linux_386_sse2",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": "",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey",
        "path": "dist/donkey_linux_arm64_v8.0/donkey",
        "goos": "linux",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "linux_arm64_v8.0",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": "",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey",
        "path": "dist/donkey_linux_amd64_v1/donkey",
        "goos": "linux",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "linux_amd64_v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": "",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey.exe",
        "path": "dist/donkey_windows_386_sse2/donkey.exe",
        "goos": "windows",
        "goarch": "386",
        "go386": "sse2",
        "target": "windows_386_sse2",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": ".exe",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey.exe",
        "path": "dist/donkey_windows_arm64_v8.0/donkey.exe",
        "goos": "windows",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "windows_arm64_v8.0",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": ".exe",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey",
        "path": "dist/donkey_darwin_arm64_v8.0/donkey",
        "goos": "darwin",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "darwin_arm64_v8.0",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": "",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey",
        "path": "dist/donkey_darwin_amd64_v1/donkey",
        "goos": "darwin",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "darwin_amd64_v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "donkey",
            "Builder": "go",
            "Ext": "",
            "ID": "donkey"
        }
    },
    {
        "name": "donkey_Linux_i386.tar.gz",
        "path": "dist/donkey_Linux_i386.tar.gz",
        "goos": "linux",
        "goarch": "386",
        "go386": "sse2",
        "target": "linux_386_sse2",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey"
            ],
            "Checksum": "sha256:f62b34f6c782e2658a5e1357f597990441fec2e9c55ccd4d9f4f67d820dba71e",
            "Format": "tar.gz",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Linux_arm64.tar.gz",
        "path": "dist/donkey_Linux_arm64.tar.gz",
        "goos": "linux",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "linux_arm64_v8.0",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey"
            ],
            "Checksum": "sha256:0d16df1f0472b35e7afc8dab08fcd5c0dc418908c69404f0449be586ddb0249c",
            "Format": "tar.gz",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Darwin_x86_64.tar.gz",
        "path": "dist/donkey_Darwin_x86_64.tar.gz",
        "goos": "darwin",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "darwin_amd64_v1",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey"
            ],
            "Checksum": "sha256:77ca66d77513b854c430966a11de7a7fdb9730f87b9cea38c5beec7550e71d75",
            "Format": "tar.gz",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Windows_x86_64.zip",
        "path": "dist/donkey_Windows_x86_64.zip",
        "goos": "windows",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "windows_amd64_v1",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey.exe"
            ],
            "Checksum": "sha256:87bf7f2b85d0d5d898117719b12ec647009cc37d97d175b55392be4496d9fbc3",
            "Format": "zip",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Windows_i386.zip",
        "path": "dist/donkey_Windows_i386.zip",
        "goos": "windows",
        "goarch": "386",
        "go386": "sse2",
        "target": "windows_386_sse2",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey.exe"
            ],
            "Checksum": "sha256:aa6f442916b6f8757fec2ad38905f2712ae058e92377727beb8d627aa6c31227",
            "Format": "zip",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Linux_x86_64.tar.gz",
        "path": "dist/donkey_Linux_x86_64.tar.gz",
        "goos": "linux",
        "goarch": "amd64",
        "goamd64": "v1",
        "target": "linux_amd64_v1",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey"
            ],
            "Checksum": "sha256:abe6e94f68ad5c91efc13af11e8dc87c36d5f0ae0aff15e3b7de56cb39743316",
            "Format": "tar.gz",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Windows_arm64.zip",
        "path": "dist/donkey_Windows_arm64.zip",
        "goos": "windows",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "windows_arm64_v8.0",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey.exe"
            ],
            "Checksum": "sha256:b903504f2e48ba8552e328ec9e80635ec4f79e99bfdc3356527533d8f826bf6c",
            "Format": "zip",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "donkey_Darwin_arm64.tar.gz",
        "path": "dist/donkey_Darwin_arm64.tar.gz",
        "goos": "darwin",
        "goarch": "arm64",
        "goarm64": "v8.0",
        "target": "darwin_arm64_v8.0",
        "internal_type": 1,
        "type": "Archive",
        "extra": {
            "Binaries": [
                "donkey"
            ],
            "Checksum": "sha256:159c3afc632d2df252d432dafe94dca1a85fafffb9f9792821f1f23c6b2469cd",
            "Format": "tar.gz",
            "ID": "default",
            "Replaces": null,
            "WrappedIn": ""
        }
    },
    {
        "name": "checksums.txt",
        "path": "dist/checksums.txt",
        "internal_type": 12,
        "type": "Checksum",
        "extra": {}
    },
    {
        "name": "donkey.rb",
        "path": "dist/homebrew/Formula/donkey.rb",
        "internal_type": 16,
        "type": "Brew Tap",
        "extra": {
            "BrewConfig": {
                "name": "donkey",
                "repository": {
                    "owner": "evg4b",
                    "name": "homebrew-tap",
                    "token": "{{ .Env.GITHUB_TOKEN }}",
                    "git": {},
                    "pull_request": {
                        "base": {}
                    }
                },
                "commit_author": {
                    "name": "Evgeny Abramovich",
                    "email": "evg.abramovitch@gmail.com"
                },
                "commit_msg_template": "Brew formula update for {{ .ProjectName }} version {{ .Tag }}",
                "directory": "Formula",
                "test": "system \\"#{bin}/donkey\\", \\"--version\\"",
                "description": "🫏 A small utility for batch file rpecessing using AI",
                "homepage": "https://github.com/evg4b/donkey",
                "license": "GPL-3.0",
                "goarm": "6",
                "goamd64": "v1"
            }
        }
    },
    {
        "name": "donkey.json",
        "path": "dist/scoop/bucket/donkey.json",
        "internal_type": 24,
        "type": "Scoop Manifest",
        "extra": {
            "ScoopConfig": {
                "name": "donkey",
                "repository": {
                    "owner": "evg4b",
                    "name": "scoop-bucket",
                    "token": "{{ .Env.GITHUB_TOKEN }}",
                    "branch": "main",
                    "git": {},
                    "pull_request": {
                        "base": {}
                    }
                },
                "directory": "bucket",
                "commit_author": {
                    "name": "Evgeny Abramovich",
                    "email": "evg.abramovitch@gmail.com"
                },
                "commit_msg_template": "Scoop update for {{ .ProjectName }} version {{ .Tag }}",
                "homepage": "https://github.com/evg4b/donkey",
                "description": "A simple dev HTTP/HTTPS reverse proxy for replacing CORS headers.",
                "license": "GPL-3.0",
                "goamd64": "v1"
            }
        }
    }
]`;

  it('should return parsed content', async () => {
    readFileMock.mockResolvedValueOnce(artifactsContent);

    const artifact = await parseArtifactsFile(`/dist/artifacts.json`);

    expect(artifact).toEqual([
      {
        'name': 'metadata.json',
        'path': 'dist/metadata.json',
        'internal_type': 30,
        'type': 'Metadata',
      },
      {
        'name': 'donkey.exe',
        'path': 'dist/donkey_windows_amd64_v1/donkey.exe',
        'goos': 'windows',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'windows_amd64_v1',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '.exe',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey',
        'path': 'dist/donkey_linux_386_sse2/donkey',
        'goos': 'linux',
        'goarch': '386',
        'go386': 'sse2',
        'target': 'linux_386_sse2',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey',
        'path': 'dist/donkey_linux_arm64_v8.0/donkey',
        'goos': 'linux',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'linux_arm64_v8.0',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey',
        'path': 'dist/donkey_linux_amd64_v1/donkey',
        'goos': 'linux',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'linux_amd64_v1',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey.exe',
        'path': 'dist/donkey_windows_386_sse2/donkey.exe',
        'goos': 'windows',
        'goarch': '386',
        'go386': 'sse2',
        'target': 'windows_386_sse2',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '.exe',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey.exe',
        'path': 'dist/donkey_windows_arm64_v8.0/donkey.exe',
        'goos': 'windows',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'windows_arm64_v8.0',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '.exe',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey',
        'path': 'dist/donkey_darwin_arm64_v8.0/donkey',
        'goos': 'darwin',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'darwin_arm64_v8.0',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey',
        'path': 'dist/donkey_darwin_amd64_v1/donkey',
        'goos': 'darwin',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'darwin_amd64_v1',
        'internal_type': 4,
        'type': 'Binary',
        'extra': {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '',
          'ID': 'donkey',
        },
      },
      {
        'name': 'donkey_Linux_i386.tar.gz',
        'path': 'dist/donkey_Linux_i386.tar.gz',
        'goos': 'linux',
        'goarch': '386',
        'go386': 'sse2',
        'target': 'linux_386_sse2',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey',
          ],
          'Checksum': 'sha256:f62b34f6c782e2658a5e1357f597990441fec2e9c55ccd4d9f4f67d820dba71e',
          'Format': 'tar.gz',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Linux_arm64.tar.gz',
        'path': 'dist/donkey_Linux_arm64.tar.gz',
        'goos': 'linux',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'linux_arm64_v8.0',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey',
          ],
          'Checksum': 'sha256:0d16df1f0472b35e7afc8dab08fcd5c0dc418908c69404f0449be586ddb0249c',
          'Format': 'tar.gz',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Darwin_x86_64.tar.gz',
        'path': 'dist/donkey_Darwin_x86_64.tar.gz',
        'goos': 'darwin',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'darwin_amd64_v1',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey',
          ],
          'Checksum': 'sha256:77ca66d77513b854c430966a11de7a7fdb9730f87b9cea38c5beec7550e71d75',
          'Format': 'tar.gz',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Windows_x86_64.zip',
        'path': 'dist/donkey_Windows_x86_64.zip',
        'goos': 'windows',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'windows_amd64_v1',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey.exe',
          ],
          'Checksum': 'sha256:87bf7f2b85d0d5d898117719b12ec647009cc37d97d175b55392be4496d9fbc3',
          'Format': 'zip',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Windows_i386.zip',
        'path': 'dist/donkey_Windows_i386.zip',
        'goos': 'windows',
        'goarch': '386',
        'go386': 'sse2',
        'target': 'windows_386_sse2',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey.exe',
          ],
          'Checksum': 'sha256:aa6f442916b6f8757fec2ad38905f2712ae058e92377727beb8d627aa6c31227',
          'Format': 'zip',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Linux_x86_64.tar.gz',
        'path': 'dist/donkey_Linux_x86_64.tar.gz',
        'goos': 'linux',
        'goarch': 'amd64',
        'goamd64': 'v1',
        'target': 'linux_amd64_v1',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey',
          ],
          'Checksum': 'sha256:abe6e94f68ad5c91efc13af11e8dc87c36d5f0ae0aff15e3b7de56cb39743316',
          'Format': 'tar.gz',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Windows_arm64.zip',
        'path': 'dist/donkey_Windows_arm64.zip',
        'goos': 'windows',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'windows_arm64_v8.0',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey.exe',
          ],
          'Checksum': 'sha256:b903504f2e48ba8552e328ec9e80635ec4f79e99bfdc3356527533d8f826bf6c',
          'Format': 'zip',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'donkey_Darwin_arm64.tar.gz',
        'path': 'dist/donkey_Darwin_arm64.tar.gz',
        'goos': 'darwin',
        'goarch': 'arm64',
        'goarm64': 'v8.0',
        'target': 'darwin_arm64_v8.0',
        'internal_type': 1,
        'type': 'Archive',
        'extra': {
          'Binaries': [
            'donkey',
          ],
          'Checksum': 'sha256:159c3afc632d2df252d432dafe94dca1a85fafffb9f9792821f1f23c6b2469cd',
          'Format': 'tar.gz',
          'ID': 'default',
          'Replaces': null,
          'WrappedIn': '',
        },
      },
      {
        'name': 'checksums.txt',
        'path': 'dist/checksums.txt',
        'internal_type': 12,
        'type': 'Checksum',
        'extra': {},
      },
      {
        'name': 'donkey.rb',
        'path': 'dist/homebrew/Formula/donkey.rb',
        'internal_type': 16,
        'type': 'Brew Tap',
        'extra': {
          'BrewConfig': {
            'name': 'donkey',
            'repository': {
              'owner': 'evg4b',
              'name': 'homebrew-tap',
              'token': '{{ .Env.GITHUB_TOKEN }}',
              'git': {},
              'pull_request': {
                'base': {},
              },
            },
            'commit_author': {
              'name': 'Evgeny Abramovich',
              'email': 'evg.abramovitch@gmail.com',
            },
            'commit_msg_template': 'Brew formula update for {{ .ProjectName }} version {{ .Tag }}',
            'directory': 'Formula',
            'test': 'system "#{bin}/donkey", "--version"',
            'description': '🫏 A small utility for batch file rpecessing using AI',
            'homepage': 'https://github.com/evg4b/donkey',
            'license': 'GPL-3.0',
            'goarm': '6',
            'goamd64': 'v1',
          },
        },
      },
      {
        'name': 'donkey.json',
        'path': 'dist/scoop/bucket/donkey.json',
        'internal_type': 24,
        'type': 'Scoop Manifest',
        'extra': {
          'ScoopConfig': {
            'name': 'donkey',
            'repository': {
              'owner': 'evg4b',
              'name': 'scoop-bucket',
              'token': '{{ .Env.GITHUB_TOKEN }}',
              'branch': 'main',
              'git': {},
              'pull_request': {
                'base': {},
              },
            },
            'directory': 'bucket',
            'commit_author': {
              'name': 'Evgeny Abramovich',
              'email': 'evg.abramovitch@gmail.com',
            },
            'commit_msg_template': 'Scoop update for {{ .ProjectName }} version {{ .Tag }}',
            'homepage': 'https://github.com/evg4b/donkey',
            'description': 'A simple dev HTTP/HTTPS reverse proxy for replacing CORS headers.',
            'license': 'GPL-3.0',
            'goamd64': 'v1',
          },
        },
      },
    ]);
  });

  it('should throw an error if the given invalid file', () => {
    readFileMock.mockResolvedValueOnce(`{ "name": "test" }`);

    expect(parseArtifactsFile(`/dist/artifacts.json`)).rejects.toThrow(Error);
  });
});

describe('validateBinaryArtifact', () => {
  const cases = [
    { name: 'null', object: {}, expected: false },
    { name: 'empty object', object: {}, expected: false },
    {
      name: 'checksum artifact',
      object: {
        name: 'Checksum',
        path: 'dist/checksums.txt',
        internal_type: 12,
        type: 'Checksum',
      } satisfies ChecksumArtifact,
      expected: false,
    },
    {
      name: 'partial binary artifact',
      object: {
        name: 'donkey',
        path: 'dist/donkey_linux_amd64_v1/donkey',
        goos: 'linux',
        goarch: 'amd64',
        internal_type: 4,
        type: 'Binary',
      },
      expected: false,
    },
    {
      name: 'full binary artifact',
      object: {
        name: 'donkey',
        path: 'dist/donkey_linux_amd64_v1/donkey',
        goos: 'windows',
        goarch: 'amd64',
        internal_type: 4,
        type: 'Binary',
        extra: {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '.exe',
          'ID': 'donkey',
        },
      } as BinaryArtifact,
      expected: true,
    },
    {
      name: 'full binary artifact with incorrect internal_type',
      object: {
        name: 'donkey',
        path: 'dist/donkey_linux_amd64_v1/donkey',
        goos: 'windows',
        goarch: 'amd64',
        internal_type: 5,
        type: 'Binary',
        extra: {
          'Binary': 'donkey',
          'Builder': 'go',
          'Ext': '.exe',
          'ID': 'donkey',
        },
      },
      expected: false,
    },
  ];

  it.each(cases)('for $name should return $expected', ({ object, expected }) => {
    expect(validateBinaryArtifact([object])).toEqual(expected);
  });
});
