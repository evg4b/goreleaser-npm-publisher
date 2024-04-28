import { glob } from 'glob';
import { isEmpty } from 'lodash';
import * as console from 'node:console';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { parse as parsePath } from 'path';
import type { ArgumentsCamelCase } from 'yargs';
import { parseArtifactsFile, parseMetadata, writePackage } from '../core/files';
import { Context } from '../core/gorealiser';
import js from '../core/js';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../core/package';
import { binArtifactPredicate } from '../helpers';

export const buildHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async args => {
  const context = new Context(args.project);
  const artifacts = await parseArtifactsFile(context.artifactsPath);
  const metadata = await parseMetadata(context.metadataPath);

  const binaryArtifacts = artifacts.filter(binArtifactPredicate(args.builder));

  const packages: PackageDefinition[] = [];

  const files = await glob(args.files, {
    ignore: 'node_modules/**',
    cwd: args.project,
  });

  for (const artifact of binaryArtifacts) {
    const pathItems = artifact.path.split(sep);
    const { path } = artifact;
    const sourceArtifactPath = join(args.project, path);
    const { base } = parsePath(path);
    const npmArtifactPath = context.packageFolder(pathItems[1]);
    await mkdir(npmArtifactPath, { recursive: true });
    const npmArtifact = join(npmArtifactPath, base);
    const packageDefinition = transformPackage(artifact, metadata, files);
    packages.push(packageDefinition);

    await copyFile(sourceArtifactPath, npmArtifact);
    const packageJsonObject = formatPackageJson(packageDefinition, args.description, args.prefix, files);
    await writePackage(context.packageJson(pathItems[1]), packageJsonObject);
    for (const file of files) {
      const sourceFile = context.project(file);
      const destFile = context.packageFolder(pathItems[1], file);
      console.log(`Copied file ${ sourceFile }, to ${ destFile }`);
      await copyFile(sourceFile, destFile);
    }
    console.log(`Built package ${ pathItems[1] }`);
  }

  const packageJsonObject = formatMainPackageJson(packages, metadata, args.description, args.prefix, files);
  await mkdir(context.packageFolder(metadata.project_name), { recursive: true });
  await writePackage(context.packageJson(metadata.project_name), packageJsonObject);
  await writeFile(
    join(context.packageFolder(metadata.project_name), 'index.js'),
    buildExecScript(packages, args.prefix),
    'utf-8',
  );
  for (const file of files) {
    const sourceFile = context.project(file);
    const destFile = context.packageFolder(metadata.project_name, file);
    console.log(`Copied file ${ sourceFile }, to ${ destFile }`);
    await copyFile(sourceFile, destFile);
  }
};

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

