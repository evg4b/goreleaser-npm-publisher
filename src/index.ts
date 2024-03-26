import yargs from 'yargs';
import { buildCommand } from './commands';

yargs.scriptName('goreleaser-npm-publisher')
    .usage('$0 <cmd> [args]')
    .command('build', 'Build the project', buildCommand.builder, buildCommand.handler)
    .help()
    .argv;
