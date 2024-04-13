#!/usr/bin/env node
import { identity } from 'lodash';
import { scriptName, terminalWidth } from 'yargs';
import { buildHandler, listHandler, publishHandler } from './commands';
import { createDistFolder, isDistEmptyCheck } from './helpers';

void scriptName('goreleaser-npm-publisher')
  .usage('$0 <cmd> [args]')
  .option('project', {
    alias: 'p',
    type: 'string',
    describe: 'Path to the project with was built by GoReleaser',
    demandOption: true,
  })
  .option('builder', {
    alias: 'b',
    type: 'string',
    describe: 'Name of the builder',
  })
  .option('clear', {
    alias: 'c',
    type: 'boolean',
    describe: 'Clear the dist/npm folder before building the project',
    default: false,
  })
  .option('prefix', {
    type: 'string',
    describe: 'Prefix for the npm package',
  })
  .option('description', {
    type: 'string',
    describe: 'Description for the npm package',
  })
  .command(
    'list',
    'List the project',
    identity,
    listHandler,
  )
  .check(isDistEmptyCheck)
  .command(
    'build',
    'Build the project',
    identity,
    buildHandler,
    [createDistFolder],
  )
  .command(
    'publish',
    'Publish the project to npm registry',
    identity,
    publishHandler,
    [createDistFolder],
  )
  .demandCommand(1, 'You need at least one command before moving on to the next step')
  .showHelpOnFail(false, 'Specify --help for available options')
  .wrap(Math.min(100, terminalWidth()))
  .global('project')
  .global('builder')
  .hide('version')
  .hide('help')
  .help()
  .argv;

