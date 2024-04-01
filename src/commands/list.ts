import { ArgumentsCamelCase } from 'yargs';
import { parseArtifactsFile, parseMetadata } from '../files';
import { Context } from '../gorealiser';
import { binArtifactPredicate } from '../helpers';
import { formatPackageName, transformPackage } from '../package';

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

