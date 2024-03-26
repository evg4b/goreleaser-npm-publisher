// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    goos: string;
    goarch: string;
}
