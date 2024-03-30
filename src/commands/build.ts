import { copyFile, mkdir } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { parse as parsePath } from 'path';
import { ArgumentsCamelCase } from 'yargs';
import { parseArtifactsFile, parseMetadata, writePackage } from '../files';
import { Context } from '../gorealiser';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../package';


export const buildHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  const context = new Context(args.project);
  const artifactsData = await parseArtifactsFile(context.artifactsPath);
  const metadata = await parseMetadata(context.metadataPath);

  const artifacts = artifactsData.filter(({ extra, type }) => {
    return extra.ID === args.builder && type === 'Binary';
  });

  const packages: PackageDefinition[] = [];

  for (const artifact of artifacts) {
    const pathItems = artifact.path.split(sep);
    const { path } = artifact;
    const sourceArtifactPath = join(args.project, path);
    const { base } = parsePath(path);
    const npmArtifactPath = context.packageFolder(pathItems[1]);
    await mkdir(npmArtifactPath, { recursive: true });
    const npmArtifact = join(npmArtifactPath, base);
    const packageDefinition = transformPackage(artifact, metadata);
    packages.push(packageDefinition);

    await copyFile(sourceArtifactPath, npmArtifact);
    const packageJsonObject = formatPackageJson(packageDefinition, args.prefix);
    await writePackage(context.packageJson(pathItems[1]), packageJsonObject);
  }

  const packageJsonObject = formatMainPackageJson(packages, metadata, args.prefix);
  await mkdir(context.packageFolder(metadata.project_name), { recursive: true });
  await writePackage(context.packageJson(metadata.project_name), packageJsonObject);

};
