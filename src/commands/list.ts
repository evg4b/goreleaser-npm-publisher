import console from 'console';
import { ArgumentsCamelCase, Argv, BuilderCallback } from 'yargs';
import { parseArtifactsFile, parseMetadata } from '../files';
import { Context } from '../gorealiser/context';
import { formatPackageName, transformPackage } from '../package/transform';

const builder: BuilderCallback<DefaultParams, DefaultParams> = (yargs): Argv => {
  return yargs;
};

const handler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  const context = new Context(args.project);
  const metadata = await parseMetadata(context.metadataPath);
  const artifacts = (await parseArtifactsFile(context.artifactsPath))
    .filter(({ extra, type }) => extra.ID === args.builder && type === 'Binary')
    .map((artifact) => transformPackage(artifact, metadata));

  artifacts.forEach((pkg) => {
    const packageName = formatPackageName(pkg, args.prefix);
    console.log(`${ packageName }@${ pkg.version } [${ pkg.os }-${ pkg.cpu }, ${ pkg.sourceBinary }]`);
  });
};

export const listCommand = {
  builder,
  handler,
};
