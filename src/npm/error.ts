import { ErrorResponse } from './models';

export class NpmExecError extends Error {
  public readonly code: string;
  public readonly summary: string;
  public readonly detail: string;

  constructor(error: ErrorResponse['error']) {
    super(`[${error.code}]: ${error.summary}`);
    this.summary = error.summary;
    this.detail = error.detail;
    this.code = error.code;
  }
}
