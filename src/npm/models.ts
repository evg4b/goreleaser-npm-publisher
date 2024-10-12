export interface BaseOptions {
  token?: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    summary: string;
    detail: string;
  }
}

export interface PublishResponse {
  id: string;
  name: string;
  version: string;
  size: number;
  unpackedSize: number;
  shasum: string;
  integrity: string;
  filename: string;
  files: File[];
  entryCount: number;
  bundled: unknown[];
}

export interface File {
  path: string;
  size: number;
  mode: number;
}

export interface NpmExecContext {
  pwd?: string;
  token?: string;
}

export type NpmExecAction<T> = (env: Record<string, string>) => Promise<T>
