import { scriptName } from 'yargs';
import { buildCommand, listCommand } from './commands';

scriptName('goreleaser-npm-publisher')
    .usage('$0 <cmd> [args]')
    .command('list', 'List the project', listCommand.builder, listCommand.handler)
    .command('build', 'Build the project', buildCommand.builder, buildCommand.handler)
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
