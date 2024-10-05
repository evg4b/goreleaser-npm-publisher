import * as console from 'node:console';
import { bgWhite, black, gray, green } from 'picocolors';
import { type ArgumentsCamelCase, terminalWidth } from 'yargs';
import { findFiles, parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { type ExecContext } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

const formatPackage = (context: Context, json: PackageJson, pkg?: PackageDefinition) => {
  console.log(green(json.name));
  console.log(gray(`  version: ${json.version}`));
  if (json.description) {
    console.log(gray(`  description: ${json.description}`));
  }
  console.log(gray(`  os: ${json.os.join(', ')}`));
  console.log(gray(`  cpu: ${json.cpu.join(', ')}`));
  if (pkg) {
    console.log(gray(`  bin: ${context.packageFolder(pkg.sourceBinary)}`));
  }
  if (json.optionalDependencies) {
    console.log(gray('  optionalDependencies:'));
    for (const [name, version] of Object.entries(json.optionalDependencies)) {
      console.log(gray(`    ${name}@${version}`));
    }
  }
};

const header = (text: string) => {
  const space = Array.from({ length: terminalWidth() }).fill(' ').join('');
  return bgWhite(black(`${text}${space}`.slice(0, terminalWidth())));
};

type ActionType = (args: ArgumentsCamelCase<DefaultParams>) => void | Promise<void>;

export const listHandler =
  (ctx: ExecContext): ActionType =>
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

    ctx.info(header('   Main package:'));
    ctx.info('');
    formatPackage(context, mainPackage);
    ctx.info('');
    ctx.info(header('   Platform packages:'));
    for (const { definition, json } of descriptions) {
      ctx.info('');
      formatPackage(context, json, definition);
    }
  };
