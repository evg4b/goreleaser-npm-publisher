import { Code } from './code';
import { transform } from './transform';

/**
 * Create a new code block from a template string and data
 *
 * Example:
 * ```ts
 * const module = 'path';
 * const actual = js`const path = require(${ module });`;
 *
 * console.log(actual.toString());
 * // const path = require('path');
 * ```
 * @param templates
 * @param data
 */
export const js = (templates: TemplateStringsArray, ...data: unknown[]): Code => {
  const jsCode = templates.reduce((firsBlock, secondBlock, index) => {
    return firsBlock + transform(data[index - 1]) + secondBlock;
  });

  return new Code(jsCode);
};
