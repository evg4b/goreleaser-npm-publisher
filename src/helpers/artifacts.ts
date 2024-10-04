export const binArtifactPredicate = (builder: string | undefined) =>
  (artifact: Artifact): artifact is BinaryArtifact => {
    return artifact.type === 'Binary' && artifact.extra.ID === builder;
  };
