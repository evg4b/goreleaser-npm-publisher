import type { ArgumentsCamelCase } from 'yargs';
import { parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { formatPackageName, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

export const listHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  const context = new Context(args.project);
  const metadata = await parseMetadata(context.metadataPath);
  const artifacts = (await parseArtifactsFile(context.artifactsPath))
    .filter(binArtifactPredicate(args.builder))
    .map((artifact) => transformPackage(artifact, metadata));

  artifacts.forEach((pkg) => {
    const packageName = formatPackageName(pkg, args.prefix);
    console.log(`${ packageName }@${ pkg.version } [${ pkg.os }-${ pkg.cpu }, ${ pkg.sourceBinary }]`);
  });
};

