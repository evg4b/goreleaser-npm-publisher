import { isEmpty } from 'lodash';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { parse as parsePath } from 'path';
import { ArgumentsCamelCase } from 'yargs';
import { parseArtifactsFile, parseMetadata, writePackage } from '../files';
import { Context } from '../gorealiser';
import { formatMainPackageJson, formatPackageJson, transformPackage } from '../package';

export const buildHandler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
  const context = new Context(args.project);
  const artifactsData = await parseArtifactsFile(context.artifactsPath);
  const metadata = await parseMetadata(context.metadataPath);

  const artifacts = artifactsData.filter(({ extra, type }) => {
    return extra.ID === args.builder && type === 'Binary';
  });

  const packages: PackageDefinition[] = [];

  for (const artifact of artifacts) {
    const pathItems = artifact.path.split(sep);
    const { path } = artifact;
    const sourceArtifactPath = join(args.project, path);
    const { base } = parsePath(path);
    const npmArtifactPath = context.packageFolder(pathItems[1]);
    await mkdir(npmArtifactPath, { recursive: true });
    const npmArtifact = join(npmArtifactPath, base);
    const packageDefinition = transformPackage(artifact, metadata);
    packages.push(packageDefinition);

    await copyFile(sourceArtifactPath, npmArtifact);
    const packageJsonObject = formatPackageJson(packageDefinition, args.prefix);
    await writePackage(context.packageJson(pathItems[1]), packageJsonObject);
  }

  const packageJsonObject = formatMainPackageJson(packages, metadata, args.prefix);
  await mkdir(context.packageFolder(metadata.project_name), { recursive: true });
  await writePackage(context.packageJson(metadata.project_name), packageJsonObject);
  await writeFile(
    join(context.packageFolder(metadata.project_name), 'index.js'),
    buildExecScript(packages, args.prefix),
    'utf-8',
  );
};

const buildExecScript = (packages: PackageDefinition[], prefix: string | undefined) => {
  const mapping = packages.reduce((acc, pkg) => {
    const data = isEmpty(prefix) ? [pkg.name] : [prefix!, pkg.name];
    return { ...acc, [`${ pkg.os }_${ pkg.cpu }`]: [...data, pkg.bin] };
  }, {} as Record<string, string[]>);

  const directory = isEmpty(prefix)
    ? js`path.dirname(__dirname)`
    : js`path.dirname(path.dirname(__dirname))`;

  return js`const path = require('path');
const child_process = require('child_process');
const mapping = ${ mapping };
const modulesDirectory = ${ directory };
const definition = mapping[process.platform + '_' + process.arch];
const packagePath = path.join(modulesDirectory, ...definition);
child_process.spawn(packagePath, process.argv.splice(2), {
    stdio: 'inherit',
    env: process.env,
});`;
};


const transform = (datum: unknown): string => {
  switch (true) {
  case Code.isCode(datum):
    return datum.toString();
  case typeof datum === 'string':
    return `'${ datum }'`;
  case typeof datum === 'number':
    return datum.toString();
  case typeof datum === 'boolean':
    return datum ? 'true' : 'false';
  case datum === null:
    return 'null';
  case datum === undefined:
    return 'undefined';
  case datum instanceof Date:
    return `new Date(${ datum.getFullYear() }, ${ datum.getMonth() }, ${ datum.getDate() }, ${ datum.getHours() }, ${ datum.getMinutes() }, ${ datum.getSeconds() }, ${ datum.getMilliseconds() })`;
  case typeof datum === 'symbol':
    return `Symbol('${ datum.description }')`;
  case Array.isArray(datum):
    return !isEmpty(datum)
      ? `[ ${ datum.map(transform).join(', ') } ]`
      : '[]';
  case typeof datum === 'object':
    return !isEmpty(datum)
      ? `{ ${ Object.entries(datum)
        .map(([key, value]) => `${ key }: ${ transform(value) }`)
        .join(', ') } }`
      : '{}';
  }

  throw new Error(`Unsupported type: ${ typeof datum }`);
};

export const js = (templates: TemplateStringsArray, ...data: unknown[]): Code => {
  let index = 0;
  const jsCode = templates.reduce((code, codePart) => {
    return code + transform(data[index++]) + codePart;
  });

  return new Code(jsCode);
};

class Code extends String {
  private __code = true;

  public static isCode(value: unknown): value is Code {
    return value instanceof Code && value.__code;
  }
}
