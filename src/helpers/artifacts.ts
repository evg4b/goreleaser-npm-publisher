export const binArtifactPredicate =
  (builder: string | undefined) =>
  (artifact: Artifact): artifact is BinaryArtifact => {
    return artifact.type === 'Binary' && artifact.extra.ID === builder;
  };

// Artifact paths carry the separator of the machine that ran goreleaser, not the one publishing.
export const artifactFolder = (path: string): string => {
  const [, folder] = path.split(/[\\/]/);
  if (!folder) {
    throw new Error(`Could not detect the target folder of the artifact ${path}`);
  }

  return folder;
};
