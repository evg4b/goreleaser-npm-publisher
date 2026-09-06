import type { Argv } from 'yargs';
import { defaultRepositoryType, repositoryTypes } from '@core/package';

export const projectOption = <T>(builder: Argv<T>) =>
  builder.option('project', {
    alias: 'p',
    type: 'string',
    describe: 'Path to the project root built by GoReleaser',
    default: '.',
  });

export const builderOption = <T>(builder: Argv<T>) =>
  builder.option('builder', {
    alias: 'b',
    type: 'string',
    describe: 'Name of the GoReleaser builder whose output is used to build the packages',
  });

export const clearOption = <T>(builder: Argv<T>) =>
  builder.option('clear', {
    alias: 'c',
    type: 'boolean',
    describe: 'Clear the dist/npm folder before building',
    default: false,
  });

export const nameOption = <T>(builder: Argv<T>) =>
  builder.option('name', {
    alias: 'n',
    type: 'string',
    describe: 'Base name for the npm packages (defaults to the GoReleaser project name)',
  });

export const binOption = <T>(builder: Argv<T>) =>
  builder.option('bin', {
    type: 'string',
    describe: 'Name of the installed command (defaults to the package name)',
  });

export const prefixOption = <T>(builder: Argv<T>) =>
  builder.option('prefix', {
    type: 'string',
    describe: 'Scope prefix for the npm packages',
  });

export const repositoryOption = <T>(builder: Argv<T>) =>
  builder.option('repository', {
    type: 'string',
    describe: 'Source repository URL for the npm packages (required for npm provenance)',
  });

export const repositoryTypeOption = <T>(builder: Argv<T>) =>
  builder.option('repository-type', {
    type: 'string',
    choices: repositoryTypes,
    describe: `Type of the source repository (detected from the repository URL, ${defaultRepositoryType} by default)`,
  });

export const repositoryDirectoryOption = <T>(builder: Argv<T>) =>
  builder.option('repository-directory', {
    type: 'string',
    describe: 'Directory of the package inside the source repository (for monorepos)',
  });

export const descriptionOption = <T>(builder: Argv<T>) =>
  builder.option('description', {
    type: 'string',
    describe: 'Description for the npm packages',
  });

export const filesOption = <T>(builder: Argv<T>) =>
  builder.option('files', {
    type: 'array',
    string: true,
    describe: 'File globs to include in the npm packages',
    default: ['readme.md', 'license'],
  });

export const keywordsOption = <T>(builder: Argv<T>) =>
  builder.option('keywords', {
    type: 'array',
    string: true,
    describe: 'Keywords for the npm packages',
  });

export const licenseOption = <T>(builder: Argv<T>) =>
  builder.option('license', {
    type: 'string',
    describe: 'License (SPDX identifier) for the npm packages',
  });

export const tokenOption = <T>(builder: Argv<T>) =>
  builder.option('token', {
    type: 'string',
    describe: 'Token for npm registry authentication',
  });

export const otpOption = <T>(builder: Argv<T>) =>
  builder.option('otp', {
    type: 'string',
    describe: 'One-time password for npm two-factor authentication',
  });

export const verboseOption = <T>(builder: Argv<T>) =>
  builder.option('verbose', {
    type: 'boolean',
    describe: 'Show verbose output',
    default: false,
  });
