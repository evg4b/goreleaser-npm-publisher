// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PackageDefinition {
    name: string;
    version: string;
    sourceBinary: string;
    bin: string;
    destinationBinary: string;
    os: string[],
    cpu: string[];
}
