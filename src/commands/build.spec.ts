import { js } from './build';

describe('js transformer', () => {
  it('should render code without interpolation', () => {
    const actual = js`const path = require('path');`.toString();

    expect(actual).toEqual('const path = require(\'path\');');
  });

  describe('should correctly render primitives', () => {
    const cases = [
      { name: 'string', value: 'string', expected: 'const value = \'string\';' },
      { name: 'string', value: '', expected: 'const value = \'\';' },
      { name: 'integer number', value: 123, expected: 'const value = 123;' },
      { name: 'decimal number', value: 123.123123, expected: 'const value = 123.123123;' },
      { name: 'negative integer number', value: -123, expected: 'const value = -123;' },
      { name: 'negative decimal number', value: -123.123123, expected: 'const value = -123.123123;' },
      { name: 'boolean', value: true, expected: 'const value = true;' },
      { name: 'boolean', value: false, expected: 'const value = false;' },
      { name: 'null', value: null, expected: 'const value = null;' },
      { name: 'undefined', value: undefined, expected: 'const value = undefined;' },
      { name: 'NaN', value: NaN, expected: 'const value = NaN;' },
      { name: 'Infinity', value: Infinity, expected: 'const value = Infinity;' },
      { name: 'negative Infinity', value: -Infinity, expected: 'const value = -Infinity;' },
      {
        name: 'Date',
        value: new Date(2024, 2, 30, 19, 6, 29, 27),
        expected: 'const value = new Date(2024, 2, 30, 19, 6, 29, 27);',
      },
      { name: 'Symbol', value: Symbol('test-symbol'), expected: 'const value = Symbol(\'test-symbol\');' },
    ];

    cases.forEach(({ name, value, expected }) => {
      it(name, () => {
        const actual = js`const value = ${ value };`.toString();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('should correctly render objects', () => {
    const cases = [
      { name: 'empty object', value: {}, expected: 'const value = {};' },
      { name: 'object with string property', value: { key: 'value' }, expected: 'const value = { key: \'value\' };' },
      { name: 'object with number property', value: { key: 123 }, expected: 'const value = { key: 123 };' },
      { name: 'object with boolean property', value: { key: true }, expected: 'const value = { key: true };' },
      { name: 'object with null property', value: { key: null }, expected: 'const value = { key: null };' },
      {
        name: 'object with undefined property',
        value: { key: undefined },
        expected: 'const value = { key: undefined };',
      },
      { name: 'object with NaN property', value: { key: NaN }, expected: 'const value = { key: NaN };' },
      { name: 'object with Infinity property', value: { key: Infinity }, expected: 'const value = { key: Infinity };' },
      {
        name: 'object with negative Infinity property',
        value: { key: -Infinity },
        expected: 'const value = { key: -Infinity };',
      },
      {
        name: 'object with Date property',
        value: { key: new Date(2024, 2, 30, 19, 6, 29, 27) },
        expected: 'const value = { key: new Date(2024, 2, 30, 19, 6, 29, 27) };',
      },
      {
        name: 'object with Symbol property',
        value: { key: Symbol('test-symbol') },
        expected: 'const value = { key: Symbol(\'test-symbol\') };',
      },
      {
        name: 'object with nested object',
        value: { key: { nested: 'value' } },
        expected: 'const value = { key: { nested: \'value\' } };',
      },

    ];

    cases.forEach(({ name, value, expected }) => {
      it(name, () => {
        const actual = js`const value = ${ value };`.toString();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('should correctly render arrays', () => {
    const cases = [
      { name: 'empty array', value: [], expected: 'const value = [];' },
      { name: 'array with string element', value: ['value'], expected: 'const value = [ \'value\' ];' },
      { name: 'array with number element', value: [123], expected: 'const value = [ 123 ];' },
      { name: 'array with boolean element', value: [true], expected: 'const value = [ true ];' },
      { name: 'array with null element', value: [null], expected: 'const value = [ null ];' },
      {
        name: 'array with undefined element',
        value: [undefined],
        expected: 'const value = [ undefined ];',
      },
      { name: 'array with NaN element', value: [NaN], expected: 'const value = [ NaN ];' },
      { name: 'array with Infinity element', value: [Infinity], expected: 'const value = [ Infinity ];' },
      {
        name: 'array with negative Infinity element',
        value: [-Infinity],
        expected: 'const value = [ -Infinity ];',
      },
      {
        name: 'array with Date element',
        value: [new Date(2024, 2, 30, 19, 6, 29, 27)],
        expected: 'const value = [ new Date(2024, 2, 30, 19, 6, 29, 27) ];',
      },
      {
        name: 'array with Symbol element',
        value: [Symbol('test-symbol')],
        expected: 'const value = [ Symbol(\'test-symbol\') ];',
      },
      {
        name: 'array with nested array',
        value: [[1, 2, 3]],
        expected: 'const value = [ [ 1, 2, 3 ] ];',
      },
    ];

    cases.forEach(({ name, value, expected }) => {
      it(name, () => {
        const actual = js`const value = ${ value };`.toString();

        expect(actual).toEqual(expected);
      });
    });
  });
});
