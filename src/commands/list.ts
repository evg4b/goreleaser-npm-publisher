import { parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { logger } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';
import { ActionType } from './models';

const formatPackage = async (context: Context, json: PackageJson, pkg?: PackageDefinition) => {
  await logger.group(`${json.name}@${json.version}`, () => {
    if (json.description) {
      logger.info(`description: ${json.description}`);
    }
    if (json.keywords.length) {
      logger.info(`keywords: ${json.keywords.join(', ')}`);
    }
    logger.info(`version: ${json.version}`);
    logger.info(`os: ${json.os.join(', ')}`);
    logger.info(`cpu: ${json.cpu.join(', ')}`);
    if (pkg) {
      logger.info(`bin: ${context.packageFolder(pkg.sourceBinary)}`);
    }
    if (json.optionalDependencies) {
      logger.debug('  optionalDependencies:');
      for (const [name, version] of Object.entries(json.optionalDependencies)) {
        logger.debug(`    ${name}@${version}`);
      }
    }
    return Promise.resolve();
  });
};

export const listHandler: ActionType<ListParams> = async args => {
  const context = new Context(args.project);
  const metadata = await parseMetadata(context.metadataPath);
  const artifacts = await parseArtifactsFile(context.artifactsPath);
  const builder = args.builder ?? metadata.project_name;
  const keywords = args.keywords ?? [];
  const descriptions = artifacts.filter(binArtifactPredicate(builder)).map(artifact => {
    const definition = transformPackage({
      artifact,
      metadata,
      files: [],
      keywords,
    });

    return {
      definition,
      json: formatPackageJson({
        pkg: definition,
        description: args.description,
        prefix: args.prefix,
        files: [],
        keywords,
      }),
    };
  });

  const mainPackage = formatMainPackageJson({
    packages: descriptions.map(({ definition }) => definition),
    metadata,
    description: args.description,
    prefix: args.prefix,
    files: [],
    keywords,
  });

  await logger.group('Main package:', () => formatPackage(context, mainPackage));
  logger.info('');
  await logger.group('Platform packages:', async () => {
    for (const { definition, json } of descriptions) {
      logger.debug('');
      await formatPackage(context, json, definition);
    }
  });
};
