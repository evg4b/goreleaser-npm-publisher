import { scriptName, terminalWidth } from 'yargs';
import { buildCommand, listCommand } from './commands';
import { createDistFolder } from './helpers/clear-dist';
import { isDistEmptyCheck } from './helpers/is-dist-empty';

scriptName('goreleaser-npm-publisher')
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
        demandOption: false,
    })
    .option('clear', {
        alias: 'c',
        type: 'boolean',
        describe: 'Clear the dist/npm folder before building the project',
        default: false,
    })
    .check(isDistEmptyCheck)
    .command(
        'list',
        'List the project',
        listCommand.builder,
        listCommand.handler,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [createDistFolder as any],
    )
    .command(
        'build',
        'Build the project',
        buildCommand.builder,
        buildCommand.handler,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [createDistFolder as any],
    )
    .demandCommand(1, 'You need at least one command before moving on to the next step')
    .showHelpOnFail(false, 'Specify --help for available options')
    .wrap(Math.min(100, terminalWidth() ?? 100))
    .help()
    .argv;
