import { findFiles, parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { type Logger } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

const formatPackage = async (logger: Logger, context: Context, json: PackageJson, pkg?: PackageDefinition) => {
  await logger.group(`${json.name}@${json.version}`, () => {
    if (json.description) {
      logger.info(`description: ${json.description}`);
    }
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

export const listHandler =
  (logger: Logger): ActionType =>
  async args => {
    const context = new Context(args.project);
    const metadata = await parseMetadata(context.metadataPath);
    const artifacts = await parseArtifactsFile(context.artifactsPath);
    const files = await findFiles(args.project, args.files);
    const builder = args.builder ?? metadata.project_name;
    const descriptions = artifacts.filter(binArtifactPredicate(builder)).map(artifact => {
      const definition = transformPackage(artifact, metadata, files);

      return {
        definition,
        json: formatPackageJson(definition, args.description, args.prefix, files),
      };
    });

    const mainPackage = formatMainPackageJson(
      descriptions.map(({ definition }) => definition),
      metadata,
      args.description,
      args.prefix,
      files,
    );

    await logger.group('Main package:', () => formatPackage(logger, context, mainPackage));
    logger.info('');
    await logger.group('Platform packages:', async () => {
      for (const { definition, json } of descriptions) {
        logger.debug('');
        await formatPackage(logger, context, json, definition);
      }
    });
  };
