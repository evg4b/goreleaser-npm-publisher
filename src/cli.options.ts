import type { Argv } from 'yargs';

export const projectOption = <T>(builder: Argv<T>) =>
  builder.option('project', {
    alias: 'p',
    type: 'string',
    describe: 'Path to the project with was built by GoReleaser',
    default: '.',
  });

export const builderOption = <T>(builder: Argv<T>) =>
  builder.option('builder', {
    alias: 'b',
    type: 'string',
    describe: 'Name of the builder',
  });

export const clearOption = <T>(builder: Argv<T>) =>
  builder.option('clear', {
    alias: 'c',
    type: 'boolean',
    describe: 'Clear the dist/npm folder before building the project',
    default: false,
  });

export const prefixOption = <T>(builder: Argv<T>) =>
  builder.option('prefix', {
    type: 'string',
    describe: 'Prefix for the npm package',
  });

export const descriptionOption = <T>(builder: Argv<T>) =>
  builder.option('description', {
    type: 'string',
    describe: 'Description for the npm package',
  });

export const filesOption = <T>(builder: Argv<T>) =>
  builder.option('files', {
    type: 'array',
    string: true,
    describe: 'File globs to include in the npm package',
    default: ['readme.md', 'license'],
  });

export const tokenOption = <T>(builder: Argv<T>) =>
  builder.option('token', {
    type: 'string',
    describe: 'Token for the npm package',
  });

export const verboseOption = <T>(builder: Argv<T>) =>
  builder.option('verbose', {
    type: 'boolean',
    describe: 'Show verbose output',
    default: false,
  });

export const keywordsOption = <T>(builder: Argv<T>) =>
  builder.option('keywords', {
    type: 'array',
    string: true,
    describe: 'Keywords for the npm package',
  });

export const licenseOption = <T>(builder: Argv<T>) =>
  builder.option('license', {
    type: 'string',
    describe: 'Package license / SPDX identifier',
  });
