import console from 'console';
import { ArgumentsCamelCase, Argv, BuilderCallback } from 'yargs';
import { parseArtifactsFile, parseMetadata } from '../files';
import { Context } from '../gorealiser/context';
import { transformPackage } from '../package/transform';

const projectPath = '/Users/evg4b/Desktop/go-package';
const buildName = 'go-package';

const builder: BuilderCallback<DefaultParams, DefaultParams> = (yargs): Argv => {
    return yargs;
};


const handler: ((args: ArgumentsCamelCase<DefaultParams>) => (void | Promise<void>)) = async (args) => {
    console.log('Building the project...', args.path);

    const context = new Context(projectPath);

    const metadata = await parseMetadata(context.metadataPath);

    const artifacts = (await parseArtifactsFile(context.artifactsPath))
        .filter(({ extra, type }) => extra.ID === buildName && type === 'Binary')
        .map((artifact) => transformPackage(artifact, metadata));

    artifacts.forEach((pkg) => {
        console.log(`${ pkg.name }@${ pkg.version } [${ pkg.os[0] }, ${ pkg.cpu[0] }, ${ pkg.sourceBinary }]`);
    });


    // console.log('Project name:', project_name);
    // console.log('Target build:', targetBuild);
    // console.log('Artifacts:', artifacts);

    // console.log(project_name, targetBuild, artifacts);
};

export const listCommand = {
    builder,
    handler,
};
