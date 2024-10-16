/**
 * Code block class
 */
export class Code extends String {
  readonly #code = true;

  public static isCode(value: unknown): value is Code {
    return value instanceof Code && value.#code;
  }
}
