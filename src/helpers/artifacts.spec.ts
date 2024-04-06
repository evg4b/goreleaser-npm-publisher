import { binArtifactPredicate } from './artifacts';

describe('artifacts', () => {
  const artifacts: Artifact[] = [
    {
      name: 'package',
      path: '/usr/bin/package',
      goos: 'linux',
      goarch: 'amd64',
      goamd64: '1.15',
      internal_type: 4,
      type: 'Binary',
      extra: {
        Binary: 'package',
        Ext: '.exe',
        ID: 'builder',
      },
    },
    {
      name: 'package',
      path: '/usr/bin/package',
      goos: 'linux',
      goarch: '386',
      internal_type: 4,
      type: 'Binary',
      extra: {
        Binary: 'package',
        ID: 'builder1',
      },
    },
    {
      name: 'package',
      path: '/usr/bin/package',
      goos: 'linux',
      goarch: 'arm',
      internal_type: 4,
      type: 'Binary',
      extra: {
        Binary: 'package',
        ID: 'builder',
      },
    },
    {
      name: 'checksum_file',
      path: '/path/to/checksum_file.txt',
      internal_type: 12,
      type: 'Checksum',
      extra: {
        algorithm: 'SHA-256',
        value: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      },
    },
    {
      name: 'my_archive',
      path: '/path/to/my_archive.tar.gz',
      goos: 'linux',
      goarch: 'amd64',
      goamd64: '1.15',
      internal_type: 1,
      type: 'Archive',
      extra: {
        Binaries: ['binary1', 'binary2'],
        Checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        Format: 'tar.gz',
        ID: '123456789',
        Replaces: null,
        WrappedIn: 'my_folder',
      },
    },
  ];

  it('should return empty array when builder is not defined', () => {
    const actual = artifacts.filter(binArtifactPredicate('some-builder'));

    expect(actual).toEqual([]);
  });

  it('should return array of builder', () => {
    const actual = artifacts.filter(binArtifactPredicate('builder'));

    expect(actual).toEqual([
      {
        extra: {
          Binary: 'package',
          Ext: '.exe',
          ID: 'builder',
        },
        goamd64: '1.15',
        goarch: 'amd64',
        goos: 'linux',
        internal_type: 4,
        name: 'package',
        path: '/usr/bin/package',
        type: 'Binary',
      },
      {
        extra: {
          Binary: 'package',
          ID: 'builder',
        },
        goarch: 'arm',
        goos: 'linux',
        internal_type: 4,
        name: 'package',
        path: '/usr/bin/package',
        type: 'Binary',
      },
    ]);
  });
});
