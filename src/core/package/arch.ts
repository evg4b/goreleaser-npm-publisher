const archMapping: Partial<Record<GOARCH, CPU>> = {
  amd64: 'x64',
  386: 'ia32',
  arm: 'arm',
  arm64: 'arm64',
  s390x: 's390x',
  s390: 's390',
  riscv64: 'riscv64',
  ppc64: 'ppc64',
  ppc: 'ppc',
  mips: 'mips',
};

export const normalizeArch = (goarch: GOARCH): CPU => {
  const normalized = archMapping[goarch];
  if (!normalized) {
    throw new Error(`${goarch} is not supported`);
  }

  return normalized;
};
