/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  arrowParens: 'avoid',
  singleAttributePerLine: true,
  endOfLine: 'lf',
  printWidth: 120,
  quoteProps: 'consistent',
  bracketSpacing: true,
};

export default config;
