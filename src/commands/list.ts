import * as console from 'node:console';
import { bgWhite, black, gray, green } from 'picocolors';
import { type ArgumentsCamelCase, terminalWidth } from 'yargs';
import { findFiles, parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

const formatPackage = (context: Context, json: PackageJson, pkg?: PackageDefinition) => {
  console.log(green(json.name));
  console.log(gray(`  version: ${ json.version }`));
  if (json.description) {
    console.log(gray(`  description: ${ json.description }`));
  }
  console.log(gray(`  os: ${ json.os.join(', ') }`));
  console.log(gray(`  cpu: ${ json.cpu.join(', ') }`));
  if (pkg) {
    console.log(gray(`  bin: ${ context.packageFolder(pkg.sourceBinary) }`));
  }
  if (json.optionalDependencies) {
    console.log(gray('  optionalDependencies:'));
    for (const [name, version] of Object.entries(json.optionalDependencies)) {
      console.log(gray(`    ${ name }@${ version }`));
    }
  }
};

const header = (text: string) => {
  const space = Array.from({ length: terminalWidth() }).fill(' ').join('');
  return bgWhite(black(`${ text }${ space }`.slice(0, terminalWidth())));
};

export const listHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async args => {
  const context = new Context(args.project);
  const metadata = await parseMetadata(context.metadataPath);
  const artifacts = await parseArtifactsFile(context.artifactsPath);
  const files = await findFiles(args.project, args.files);
  const descriptions = artifacts.filter(binArtifactPredicate(args.builder))
    .map(artifact => {
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

  console.log(header('   Main package:'));
  console.log('');
  formatPackage(context, mainPackage);
  console.log('');
  console.log(header('   Platform packages:'));
  for (const { definition, json } of descriptions) {
    console.log('');
    formatPackage(context, json, definition);
  }
};

