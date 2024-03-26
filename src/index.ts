import * as console from 'console';
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join, parse as parsePath, sep } from 'node:path';
import { parseArtifactsFile, parseMetadata } from './files';
import { writePackage } from './files/package';
import { Context } from './gorealiser/context';
import { transformPackage } from './package/transform';

const projectPath = '/Users/evg4b/Desktop/go-package';
const buildName = 'go-package';

(async () => {
    const context = new Context(projectPath);

    const artifactsData = await parseArtifactsFile(context.artifactsPath);
    const metadata = await parseMetadata(context.metadataPath);


    await unlink(context.distPath).catch(() => {});
    await mkdir(context.distPath, { recursive: true });

    const artifacts = artifactsData.filter(({ extra, type }) => {
        return extra.ID === buildName && type === 'Binary';
    });

    for (const artifact of artifacts) {
        const pathItems = artifact.path.split(sep);
        const { path } = artifact;
        const sourceArtifactPath = join(projectPath, path);
        const { base } = parsePath(path);
        const npmArtifactPath = context.packageFolder(pathItems[1]);
        await mkdir(npmArtifactPath, { recursive: true });
        const npmArtifact = join(npmArtifactPath, base);
        const packageDefinition = transformPackage(artifact, metadata);

        console.log('Package:', packageDefinition);


        await copyFile(sourceArtifactPath, npmArtifact);
        await writePackage(context.packageJson(pathItems[1]), packageDefinition);
    }

    // console.log('Project name:', project_name);
    // console.log('Target build:', targetBuild);
    // console.log('Artifacts:', artifacts);

    // console.log(project_name, targetBuild, artifacts);
})();
