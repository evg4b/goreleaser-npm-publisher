export const binArtifactPredicate =
  (builder: string | undefined) =>
  (artifact: Artifact): artifact is BinaryArtifact => {
    return artifact.type === 'Binary' && artifact.extra.ID === builder;
  };

export const artifactFolder = (path: string): string => {
  const [, folder] = path.split(/[\\/]/);
  if (!folder) {
    throw new Error(`Could not detect the target folder of the artifact ${path}`);
  }

  return folder;
};
