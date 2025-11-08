#!/usr/bin/env node
import { scriptName, terminalWidth } from 'yargs';
import { buildHandler, listHandler, publishHandler } from './commands';
import { ConsoleLogger, setLogger } from './core/logger';
import { createDistFolder, isDistEmptyCheck } from './helpers';
import {
  builderOption,
  clearOption,
  descriptionOption,
  filesOption,
  keywordsOption,
  licenseOption,
  prefixOption,
  projectOption,
  tokenOption,
  verboseOption,
} from './cli.options';

setLogger(new ConsoleLogger(console, false));

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
        .then(keywordsOption)
        .then(verboseOption)
        .then(licenseOption),
    options => buildHandler(options),
    [isDistEmptyCheck as never, createDistFolder as never],
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
        .then(keywordsOption)
        .then(tokenOption)
        .then(verboseOption)
        .then(licenseOption),
    options => publishHandler(options),
    [isDistEmptyCheck as never, createDistFolder as never],
  )
  .demandCommand(1, 'You need at least one command before moving on to the next step')
  .showHelpOnFail(false, 'Specify --help for available options')
  .wrap(Math.min(100, terminalWidth()))
  .global('project')
  .global('builder')
  .hide('version')
  .hide('help')
  .help().argv;
