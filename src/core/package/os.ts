const platformMapping: Partial<Record<GOOS, OS>> = {
  darwin: 'darwin',
  linux: 'linux',
  windows: 'win32',
  android: 'android',
  aix: 'aix',
  freebsd: 'freebsd',
  openbsd: 'openbsd',
  solaris: 'sunos',
  netbsd: 'netbsd',
};

export const normalizeOS = (goos: GOOS): OS => {
  const normalized = platformMapping[goos];
  if (!normalized) {
    throw new Error(`${goos} is not supported`);
  }

  return normalized;
};
