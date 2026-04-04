#!/usr/bin/env node
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { buildHandler, listHandler, publishHandler } from './commands';
import { ConsoleLogger, setLogger } from './core/logger';
import { handleCliError } from './cli-error-handler';
import { createDistFolder, isDistEmptyCheck } from './helpers';
import {
  builderOption,
  clearOption,
  descriptionOption,
  filesOption,
  keywordsOption,
  licenseOption,
  otpOption,
  prefixOption,
  projectOption,
  tokenOption,
  verboseOption,
} from './cli.options';

setLogger(new ConsoleLogger(console, false));

const cli = yargs(hideBin(process.argv));

Promise.resolve(
  cli
    .scriptName('goreleaser-npm-publisher')
    .version(__VERSION__)
    .usage('$0 <cmd> [args]')
    .command(
      'list',
      'List the project',
      (builder: Argv) =>
        Promise.resolve(builder)
          .then(projectOption)
          .then(builderOption)
          .then(prefixOption)
          .then(descriptionOption)
          .then(verboseOption),
      (options: ListParams) => listHandler(options),
    )
    .command(
      'build',
      'Build the project',
      (builder: Argv) =>
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
      (options: BuildParams) => buildHandler(options),
      [isDistEmptyCheck as never, createDistFolder as never],
    )
    .command(
      'publish',
      'Publish the project to npm registry',
      (builder: Argv) =>
        Promise.resolve(builder)
          .then(projectOption)
          .then(builderOption)
          .then(clearOption)
          .then(prefixOption)
          .then(descriptionOption)
          .then(filesOption)
          .then(keywordsOption)
          .then(tokenOption)
          .then(otpOption)
          .then(verboseOption)
          .then(licenseOption),
      (options: PublishParams) => publishHandler(options),
      [isDistEmptyCheck as never, createDistFolder as never],
    )
    .demandCommand(1, 'You need at least one command before moving on to the next step')
    .fail((msg, err) => handleCliError(msg, err))
    .showHelpOnFail(false, 'Specify --help for available options')
    .wrap(Math.min(100, cli.terminalWidth()))
    .global('project')
    .global('builder')
    .hide('version')
    .hide('help')
    .help().argv,
).catch(() => undefined);
