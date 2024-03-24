import * as console from 'console';
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join, parse as parsePath, sep } from 'node:path';
import { parseArtifactsFile } from './files/artifacts';
import { parseMetadata } from './files/metadata';
import { transformPackage } from './package/transform';

const projectPath = '/Users/evg4b/Desktop/go-package';
const buildName = 'go-package';

(async () => {
    const artifactsPath = join(projectPath, 'dist', 'artifacts.json');
    const metadataPath = join(projectPath, 'dist', 'metadata.json');
    const npmProjectPath = join(projectPath, 'dist', 'npm');

    const artifactsData = await parseArtifactsFile(artifactsPath);
    const metadata = await parseMetadata(metadataPath);


    await unlink(npmProjectPath).catch(() => {});
    await mkdir(npmProjectPath, { recursive: true });

    const artifacts = artifactsData.filter(({ extra, type }) => {
        return extra.ID === buildName && type === 'Binary';
    });

    for (const artifact of artifacts) {
        const pathItems = artifact.path.split(sep);
        const { path } = artifact;
        const sourceArtifactPath = join(projectPath, path);
        const { base } = parsePath(path);
        const npmArtifactPath = join(npmProjectPath, pathItems[1]);
        const npmArtifact = join(npmArtifactPath, base);
        const packageDefinition = transformPackage(artifact, metadata);

        console.log('Package:', packageDefinition);

        await mkdir(npmArtifactPath, { recursive: true });
        await copyFile(sourceArtifactPath, npmArtifact);
    }

    // console.log('Project name:', project_name);
    // console.log('Target build:', targetBuild);
    // console.log('Artifacts:', artifacts);

    // console.log(project_name, targetBuild, artifacts);
})();
