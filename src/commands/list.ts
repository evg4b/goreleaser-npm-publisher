import * as console from 'node:console';
import { bgWhite, black, gray, green } from 'picocolors';
import { type ArgumentsCamelCase, terminalWidth } from 'yargs';
import { parseArtifactsFile, parseMetadata } from '../core/files';
import { Context } from '../core/gorealiser';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

const formatPackage = (context: Context, json: PackageJson, pkg?: PackageDefinition) => {
  console.log(`${ green(json.name) }${ gray(`@${ json.version.replaceAll('v', '') }`) }`);
  console.log(gray(`  os: ${ json.os.join(', ') }`));
  console.log(gray(`  cpu: ${ json.cpu.join(', ') }`));
  if (pkg) {
    console.log(gray(`  bin: ${ context.packageFolder(pkg.sourceBinary) }`));
  }
};

const header = (text: string) => {
  const space = Array.from({ length: terminalWidth() }).fill(' ').join('');
  return bgWhite(black(`${ text }${ space }`.slice(0, terminalWidth())));
};

export const listHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  const context = new Context(args.project);
  const metadata = await parseMetadata(context.metadataPath);
  const artifacts = await parseArtifactsFile(context.artifactsPath);
  const descriptions = artifacts.filter(binArtifactPredicate(args.builder))
    .map((artifact) => {
      const definition = transformPackage(artifact, metadata);

      return {
        definition,
        json: formatPackageJson(definition, args.prefix),
      };
    });

  const definitions = descriptions.map(({ definition }) => definition);
  const mainPackage = formatMainPackageJson(definitions, metadata, args.prefix);


  console.log(header('   Main package:'));
  console.log('');
  formatPackage(context, mainPackage);
  console.log('');
  console.log(header('   Platform packages:'));
  console.log('');
  for (const { definition, json } of descriptions) {
    formatPackage(context, json, definition);
  }
};

