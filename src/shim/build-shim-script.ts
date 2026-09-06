import shimContent from 'inline-compiled:./shim';

export const buildShimScript = (packages: PackageDefinition[], prefix: string | undefined): string => {
  const mapping = Object.fromEntries(
    packages.map(pkg => [
      `${pkg.os}_${pkg.cpu}`,
      {
        name: [prefix, pkg.name].filter(s => s != null),
        bin: pkg.bin,
      },
    ]),
  );

  return shimContent.replace('__INLINE_MAPPING__' satisfies InlineMappingPlaceholder, JSON.stringify(mapping));
};
