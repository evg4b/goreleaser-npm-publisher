interface BinaryArtifact {
  name: string;
  path: string;
  goos: GOOS;
  goarch: GOARCH;
  goamd64?: string;
  internal_type: 4;
  type: 'Binary';
  extra: {
    Binary: string;
    Ext: string;
    ID: string;
  };
}

interface ArchiveArtifact {
  name: string;
  path: string;
  goos: GOOS;
  goarch: GOARCH;
  goamd64?: string;
  internal_type: 1;
  type: 'Archive';
  extra: {
    Binaries: string[];
    Checksum: string;
    Format: string;
    ID: string;
    Replaces: string | null;
    WrappedIn: string;
  };
}

interface ChecksumArtifact {
  name: string;
  path: string;
  internal_type: 12;
  type: 'Checksum';
  extra: NonNullable<unknown>;
}

type Artifact = BinaryArtifact | ArchiveArtifact | ChecksumArtifact;
