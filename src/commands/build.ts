import { join, sep } from 'node:path';
import { parse as parsePath } from 'node:path';
import { findFiles, parseArtifactsFile, parseMetadata, validateBinaryArtifact, writePackage } from '../core/files';
import { Context } from '../core/gorealiser';
import js from '../core/js';
import { logger } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, pickRepositoryParams, transformPackage } from '../core/package';
import { assertNotEmpty, binArtifactPredicate } from '../helpers';
import { copyFile, mkdir, writeFile } from '../helpers/fs';
import { ActionType } from './models';

const copyPackageFiles = async (context: Context, name: string, files: string[]) => {
  for (const file of files) {
    const sourceFile = context.project(file);
    const destFile = context.packageFolder(name, file);
    await copyFile(sourceFile, destFile);
  }
};

export const buildHandler: ActionType<BuildParams> = async args => {
  const context = new Context(args.project);
  logger.debug(`Start build package in ${context.project()}`);

  const artifacts = await parseArtifactsFile(context.artifactsPath);
  assertNotEmpty(artifacts, 'Couldn’t find any artifacts.');
  logger.debug(`Found ${artifacts.length} artifact(s)`);
  if (args.verbose) {
    artifacts.forEach(artifact => logger.debug(`${artifact.name}: ${artifact.path}`));
  }
  const metadata = await parseMetadata(context.metadataPath);
  if (args.verbose) {
    await logger.group(`Loaded metadata:`, () => {
      logger.debug(`project_name: ${metadata.project_name}`);
      logger.debug(`tag: ${metadata.tag}`);
      logger.debug(`previous_tag: ${metadata.previous_tag}`);
      logger.debug(`version: ${metadata.version}`);
      logger.debug(`commit: ${metadata.commit}`);
      logger.debug(`date: ${metadata.date}`);
      logger.debug(`runtime_goos: ${metadata.runtime.goos}`);
      logger.debug(`runtime_goarch: ${metadata.runtime.goarch}`);
      return Promise.resolve();
    });
  }

  const packages: PackageDefinition[] = [];
  const builder = args.builder ?? metadata.project_name;
  const binaryArtifacts = artifacts.filter(binArtifactPredicate(builder));
  assertNotEmpty(binaryArtifacts, `Couldn’t find any binary artifacts from ${builder} builder`);
  if (!validateBinaryArtifact(binaryArtifacts)) {
    logger.error('Invalid binary artifacts');
    validateBinaryArtifact.errors?.forEach(error => {
      logger.error(JSON.stringify(error, null, 2));
    });
    await logger.group('artifacts:', () => {
      logger.error(JSON.stringify(binaryArtifacts, null, 2));
      return Promise.resolve();
    });
    throw new Error('Invalid binary artifacts');
  }
  logger.debug(`Found ${binaryArtifacts.length} artifact(s)`);

  const files = await findFiles(args.project, args.files);
  if (args.verbose) {
    logger.debug(`Found ${files.length} files:`);
    for (const file of files) {
      logger.debug(`${file}: ${file}`);
    }
  }

  const keywords = args.keywords ?? [];
  const repository = pickRepositoryParams(args);

  for (const artifact of binaryArtifacts) {
    const [, pathItem] = artifact.path.split(sep);
    await logger.group(`Built package ${pathItem}`, async () => {
      const sourceArtifactPath = join(args.project, artifact.path);
      const { base } = parsePath(artifact.path);
      const npmArtifactPath = context.packageFolder(pathItem);
      await mkdir(npmArtifactPath);
      logger.debug(`Created package path: ${npmArtifactPath}`);
      const npmArtifact = join(npmArtifactPath, base);
      const packageDefinition = transformPackage({
        artifact,
        metadata,
        name: args.name,
        files,
        keywords,
        license: args.license,
      });
      logger.debug(`Created package ${packageDefinition.name}: ${packageDefinition.destinationBinary}`);
      packages.push(packageDefinition);
      await copyFile(sourceArtifactPath, npmArtifact);
      const packageJsonObject = formatPackageJson({
        pkg: packageDefinition,
        description: args.description,
        prefix: args.prefix,
        ...repository,
        files,
        keywords,
      });
      const packageJsonPath = context.packageJson(pathItem);
      await writePackage(packageJsonPath, packageJsonObject);
      logger.debug(`Written package json file: ${packageJsonPath}`);
      await copyPackageFiles(context, pathItem, files);
      logger.debug(`Copied ${files.length} extra file(s)`);
    });
  }

  logger.debug(`Built ${packages.length} platform package(s)`);

  const packageJsonObject = formatMainPackageJson({
    packages,
    metadata,
    name: args.name,
    bin: args.bin,
    description: args.description,
    prefix: args.prefix,
    ...repository,
    files,
    keywords,
    license: args.license,
  });
  const mainPackageFolder = args.name ?? metadata.project_name;
  await mkdir(context.packageFolder(mainPackageFolder));
  logger.debug(`Created package path: ${context.packageFolder(mainPackageFolder)}`);
  await writePackage(context.packageJson(mainPackageFolder), packageJsonObject);
  logger.debug(`Written package json file: ${context.packageJson(mainPackageFolder)}`);
  const indexJsFile = join(context.packageFolder(mainPackageFolder), 'index.js');
  await writeFile(indexJsFile, buildExecScript(packages, args.prefix));
  logger.debug(`Written package index.js file: ${indexJsFile}`);
  await copyPackageFiles(context, mainPackageFolder, files);
  logger.debug(`Copied ${files.length} extra file(s)`);
};

export const buildExecScript = (packages: PackageDefinition[], prefix: string | undefined): string => {
  const mapping = Object.fromEntries(
    packages.map(pkg => [
      `${pkg.os}_${pkg.cpu}`,
      {
        name: [prefix, pkg.name].filter(s => s != null),
        bin: pkg.bin,
      },
    ]),
  );

  const code = js`#!/usr/bin/env node
const path = require('path');
const mapping = ${mapping};
const key = process.platform + '_' + process.arch;
const definition = mapping[key];

if (!definition) {
  console.error('Unsupported platform: ' + key + '. Supported: ' + Object.keys(mapping).join(', '));
  process.exit(1);
}

let packagePath;
try {
  const packageJsonPath = require.resolve(path.join(...definition.name, 'package.json'));
  packagePath = path.join(path.dirname(packageJsonPath), definition.bin);
} catch {
  console.error('Missing platform package for ' + key + '. Reinstall without --no-optional.');
  process.exit(1);
}

const args = process.argv.slice(2);

// process.execve aborts instead of throwing when the binary cannot be executed.
let canExec = typeof process.execve === 'function';
if (canExec) {
  try {
    require('fs').accessSync(packagePath, require('fs').constants.X_OK);
  } catch {
    canExec = false;
  }
}

if (canExec) {
  process.execve(packagePath, [packagePath, ...args]);
}

// process.execve is unavailable on Windows and before node 22.15.
const os = require('os');
const child_process = require('child_process');
const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];
const child = child_process.spawn(packagePath, args, { stdio: 'inherit' });

child.on('error', error => {
  console.error('Failed to spawn ' + packagePath + ': ' + error.message);
  process.exit(1);
});

for (const signal of signals) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  for (const registered of signals) {
    process.removeAllListeners(registered);
  }

  process.exit(signal ? 128 + (os.constants.signals[signal] ?? 0) : (code ?? 0));
});`;

  return code.toString();
};
