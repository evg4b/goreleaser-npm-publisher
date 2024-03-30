interface Artifact {
  name: string;
  path: string;
  goos?: 'linux' | 'darwin' | 'windows';
  goarch?: string;
  goamd64?: string;
  internal_type: number;
  type: 'Binary' | 'Archive' | 'Checksum';
  extra: Extra;
}

interface Extra {
  Binary?: string;
  Ext?: string;
  ID?: string;
  Binaries?: string[];
  Checksum?: string;
  Format?: string;
  Replaces?: null;
  WrappedIn?: string;
}


