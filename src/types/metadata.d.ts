interface Metadata {
  project_name: string;
  tag: string;
  previous_tag: string;
  version: string;
  commit: string;
  date: Date;
  runtime: Runtime;
}

interface Runtime {
  goos: GOOS;
  goarch: GOARCH;
}
