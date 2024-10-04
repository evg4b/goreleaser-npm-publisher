import { isEmpty } from 'lodash';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { parse as parsePath } from 'path';
import { findFiles, parseArtifactsFile, parseMetadata, writePackage } from '../core/files';
import { Context } from '../core/gorealiser';
import js from '../core/js';
import { type Logger } from '../core/logger';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

const copyPackageFiles = async (logger: Logger, context: Context, name: string, files: string[]) => {
  for (const file of files) {
    const sourceFile = context.project(file);
    const destFile = context.packageFolder(name, file);
    logger.debug(`Copied file ${ sourceFile } to ${ destFile }`);
    await copyFile(sourceFile, destFile);
  }
};

export const buildHandler = (ctx: Logger): ActionType =>
  (async args => {
    const context = new Context(args.project);
    const artifacts = await parseArtifactsFile(context.artifactsPath);
    const metadata = await parseMetadata(context.metadataPath);

    const packages: PackageDefinition[] = [];
    const builder = args.builder ?? metadata.project_name;
    const binaryArtifacts = artifacts.filter(binArtifactPredicate(builder));
    const files = await findFiles(args.project, args.files);

    for (const artifact of binaryArtifacts) {
      const pathItems = artifact.path.split(sep);
      await ctx.group(`Built package ${ pathItems[1] }`, async () => {
        const sourceArtifactPath = join(args.project, artifact.path);
        const { base } = parsePath(artifact.path);
        const npmArtifactPath = context.packageFolder(pathItems[1]);
        await mkdir(npmArtifactPath, { recursive: true });
        const npmArtifact = join(npmArtifactPath, base);
        const packageDefinition = transformPackage(artifact, metadata, files);

        packages.push(packageDefinition);

        await copyFile(sourceArtifactPath, npmArtifact);
        const packageJsonObject = formatPackageJson(packageDefinition, args.description, args.prefix, files);
        await writePackage(context.packageJson(pathItems[1]), packageJsonObject);

        await copyPackageFiles(ctx, context, pathItems[1], files);
      });
    }

    const packageJsonObject = formatMainPackageJson(packages, metadata, args.description, args.prefix, files);
    await mkdir(context.packageFolder(metadata.project_name), { recursive: true });
    await writePackage(context.packageJson(metadata.project_name), packageJsonObject);
    const indexJsFile = join(context.packageFolder(metadata.project_name), 'index.js');
    await writeFile(indexJsFile, buildExecScript(packages, args.prefix), 'utf-8');
    await copyPackageFiles(ctx, context, metadata.project_name, files);
  });

const buildExecScript = (packages: PackageDefinition[], prefix: string | undefined): string => {
  const mapping = packages.reduce<Record<string, string[]>>((mappings, pkg) => {
    const data = isEmpty(prefix) ? [pkg.name] : [String(prefix), pkg.name];
    return { ...mappings, [`${ pkg.os }_${ pkg.cpu }`]: [...data, pkg.bin] };
  }, {});

  const directory = isEmpty(prefix)
    ? js`path.dirname(__dirname)`
    : js`path.dirname(path.dirname(__dirname))`;

  const code = js`#!/usr/bin/env node
const path = require('path');
const child_process = require('child_process');
const mapping = ${ mapping };
const modulesDirectory = ${ directory };
const definition = mapping[process.platform + '_' + process.arch];
const packagePath = path.join(modulesDirectory, ...definition);
child_process.spawn(packagePath, process.argv.splice(2), {
  stdio: 'inherit',
  env: process.env,
});`;

  return code.toString();
};

