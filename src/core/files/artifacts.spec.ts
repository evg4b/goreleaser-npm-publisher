/* eslint-disable @typescript-eslint/no-floating-promises */
const readFileMock = jest.fn();

jest.mock('node:fs/promises', () => ({
  readFile: readFileMock,
}));

const artifactsContent = `[
    {
        "name": "metadata.json",
        "path": "dist/metadata.json",
        "internal_type": 30,
        "type": "Metadata"
    },
    {
        "name": "go_package",
        "path": "dist/go_package_linux_386/go_package",
        "goos": "linux",
        "goarch": "386",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": "",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package.exe",
        "path": "dist/go_package_windows_386/go_package.exe",
        "goos": "windows",
        "goarch": "386",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": ".exe",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package",
        "path": "dist/go_package_linux_arm64/go_package",
        "goos": "linux",
        "goarch": "arm64",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": "",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package",
        "path": "dist/go_package_darwin_amd64_v1/go_package",
        "goos": "darwin",
        "goarch": "amd64",
        "goamd64": "v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": "",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package",
        "path": "dist/go_package_linux_amd64_v1/go_package",
        "goos": "linux",
        "goarch": "amd64",
        "goamd64": "v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": "",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package.exe",
        "path": "dist/go_package_windows_arm64/go_package.exe",
        "goos": "windows",
        "goarch": "arm64",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": ".exe",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package.exe",
        "path": "dist/go_package_windows_amd64_v1/go_package.exe",
        "goos": "windows",
        "goarch": "amd64",
        "goamd64": "v1",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": ".exe",
            "ID": "go_package"
        }
    },
    {
        "name": "go_package",
        "path": "dist/go_package_darwin_arm64/go_package",
        "goos": "darwin",
        "goarch": "arm64",
        "internal_type": 4,
        "type": "Binary",
        "extra": {
            "Binary": "go_package",
            "Ext": "",
            "ID": "go_package"
        }
    }
]`;

import { parseArtifactsFile } from './artifacts';

describe('parseArtifactsFile', () => {
  it('should return parsed content', async () => {
    readFileMock.mockResolvedValueOnce(artifactsContent);

    const artifact = await parseArtifactsFile(`/dist/artifacts.json`);

    expect(artifact).toEqual([
      {
        name: 'metadata.json',
        path: 'dist/metadata.json',
        internal_type: 30,
        type: 'Metadata',
      },
      {
        name: 'go_package',
        path: 'dist/go_package_linux_386/go_package',
        goos: 'linux',
        goarch: '386',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package.exe',
        path: 'dist/go_package_windows_386/go_package.exe',
        goos: 'windows',
        goarch: '386',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '.exe',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package',
        path: 'dist/go_package_linux_arm64/go_package',
        goos: 'linux',
        goarch: 'arm64',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package',
        path: 'dist/go_package_darwin_amd64_v1/go_package',
        goos: 'darwin',
        goarch: 'amd64',
        goamd64: 'v1',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package',
        path: 'dist/go_package_linux_amd64_v1/go_package',
        goos: 'linux',
        goarch: 'amd64',
        goamd64: 'v1',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package.exe',
        path: 'dist/go_package_windows_arm64/go_package.exe',
        goos: 'windows',
        goarch: 'arm64',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '.exe',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package.exe',
        path: 'dist/go_package_windows_amd64_v1/go_package.exe',
        goos: 'windows',
        goarch: 'amd64',
        goamd64: 'v1',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '.exe',
          ID: 'go_package',
        },
      },
      {
        name: 'go_package',
        path: 'dist/go_package_darwin_arm64/go_package',
        goos: 'darwin',
        goarch: 'arm64',
        internal_type: 4,
        type: 'Binary',
        extra: {
          Binary: 'go_package',
          Ext: '',
          ID: 'go_package',
        },
      },
    ]);
  });

  it('should throw an error if the given invalid file', () => {
    readFileMock.mockResolvedValueOnce(`{ "name": "test" }`);

    expect(parseArtifactsFile(`/dist/artifacts.json`)).rejects.toThrow(Error);
  });
});
