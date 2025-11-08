import { join, sep } from 'node:path';
import { parse as parsePath } from 'path';
import { findFiles, parseArtifactsFile, parseMetadata, validateBinaryArtifact, writePackage } from '../core/files';
import { Context } from '../core/gorealiser';
import js from '../core/js';
import { logger } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
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
    description: args.description,
    prefix: args.prefix,
    files,
    keywords,
    license: args.license,
  });
  await mkdir(context.packageFolder(metadata.project_name));
  logger.debug(`Created package path: ${context.packageFolder(metadata.project_name)}`);
  await writePackage(context.packageJson(metadata.project_name), packageJsonObject);
  logger.debug(`Written package json file: ${context.packageJson(metadata.project_name)}`);
  const indexJsFile = join(context.packageFolder(metadata.project_name), 'index.js');
  await writeFile(indexJsFile, buildExecScript(packages, args.prefix));
  logger.debug(`Written package index.js file: ${indexJsFile}`);
  await copyPackageFiles(context, metadata.project_name, files);
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
const child_process = require('child_process');
const mapping = ${mapping};
const definition = mapping[process.platform + '_' + process.arch];
const packageJsonPath = require.resolve(path.join(...definition.name, 'package.json'));
const packagePath = path.join(path.dirname(packageJsonPath), definition.bin);
child_process.spawn(packagePath, process.argv.splice(2), {
  stdio: 'inherit',
  env: process.env,
});`;

  return code.toString();
};
