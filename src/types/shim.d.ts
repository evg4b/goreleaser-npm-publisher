interface PlatformBinary {
  name: string[];
  bin: string;
}

type Mapping = Record<string, PlatformBinary | undefined>;
declare const __INLINE_MAPPING__: Mapping;
declare type InlineMappingPlaceholder = '__INLINE_MAPPING__';

declare module 'inline-compiled:*' {
  /** Bundled source of the imported module, inlined at build time. */
  const source: string;
  export default source;
}
