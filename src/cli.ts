#!/usr/bin/env node
import { type Argv, scriptName, terminalWidth } from 'yargs';
import { buildHandler, listHandler, publishHandler } from './commands';
import { ConsoleLogger, setLogger } from './core/logger';
import { createDistFolder, initLogger, isDistEmptyCheck } from './helpers';

setLogger(new ConsoleLogger(console, false));

const projectOption = <T>(builder: Argv<T>) =>
  builder.option('project', {
    alias: 'p',
    type: 'string',
    describe: 'Path to the project with was built by GoReleaser',
    default: '.',
  });

const builderOption = <T>(builder: Argv<T>) =>
  builder.option('builder', {
    alias: 'b',
    type: 'string',
    describe: 'Name of the builder',
  });

const clearOption = <T>(builder: Argv<T>) =>
  builder.option('clear', {
    alias: 'c',
    type: 'boolean',
    describe: 'Clear the dist/npm folder before building the project',
    default: false,
  });

const prefixOption = <T>(builder: Argv<T>) =>
  builder.option('prefix', {
    type: 'string',
    describe: 'Prefix for the npm package',
  });

const descriptionOption = <T>(builder: Argv<T>) =>
  builder.option('description', {
    type: 'string',
    describe: 'Description for the npm package',
  });

const filesOption = <T>(builder: Argv<T>) =>
  builder.option('files', {
    type: 'array',
    string: true,
    describe: 'File globs to include in the npm package',
    default: ['readme.md', 'license'],
  });

const tokenOption = <T>(builder: Argv<T>) =>
  builder.option('token', {
    type: 'string',
    describe: 'Token for the npm package',
  });

const verboseOption = <T>(builder: Argv<T>) =>
  builder.option('verbose', {
    type: 'boolean',
    describe: 'Show verbose output',
    default: false,
  });

void scriptName('goreleaser-npm-publisher')
  .version(__VERSION__)
  .usage('$0 <cmd> [args]')
  .command(
    'list',
    'List the project',
    builder =>
      Promise.resolve(builder)
        .then(projectOption)
        .then(builderOption)
        .then(prefixOption)
        .then(descriptionOption)
        .then(verboseOption),
    options => listHandler(options),
    [initLogger as never],
  )
  .command(
    'build',
    'Build the project',
    builder =>
      Promise.resolve(builder)
        .then(projectOption)
        .then(builderOption)
        .then(clearOption)
        .then(prefixOption)
        .then(descriptionOption)
        .then(filesOption)
        .then(verboseOption),
    options => buildHandler(options),
    [isDistEmptyCheck as never, createDistFolder as never, initLogger as never],
  )
  .command(
    'publish',
    'Publish the project to npm registry',
    builder =>
      Promise.resolve(builder)
        .then(projectOption)
        .then(builderOption)
        .then(clearOption)
        .then(prefixOption)
        .then(descriptionOption)
        .then(filesOption)
        .then(tokenOption)
        .then(verboseOption),
    options => publishHandler(options),
    [isDistEmptyCheck as never, createDistFolder as never, initLogger as never],
  )
  .demandCommand(1, 'You need at least one command before moving on to the next step')
  .showHelpOnFail(false, 'Specify --help for available options')
  .wrap(Math.min(100, terminalWidth()))
  .global('project')
  .global('builder')
  .hide('version')
  .hide('help')
  .help().argv;
