import { isEmpty } from 'lodash';
import { Code } from './code';

const formatDate = (node: Date) => {
  const year = node.getFullYear();
  const month = node.getMonth();
  const date = node.getDate();
  const hours = node.getHours();
  const minutes = node.getMinutes();
  const seconds = node.getSeconds();
  const milliseconds = node.getMilliseconds();

  return `new Date(${ year }, ${ month }, ${ date }, ${ hours }, ${ minutes }, ${ seconds }, ${ milliseconds })`;
};

const formatObject = (node: object): string => {
  const fields = Object.entries(node)
    .map(([key, value]) => `${ key }: ${ transform(value) }`);

  return !isEmpty(node)
    ? `{ ${ fields.join(', ') } }`
    : '{}';
};

const formatArray = (node: unknown[]): string => !isEmpty(node)
  ? `[ ${ node.map(transform).join(', ') } ]`
  : '[]';

/**
 * Transform a node to a code string
 * @param node
 */
export const transform = (node: unknown): string => {
  switch (true) {
  case Code.isCode(node):
    return node.toString();
  case typeof node === 'string':
    return `'${ node }'`;
  case typeof node === 'number':
    return node.toString();
  case typeof node === 'boolean':
    return node.toString();
  case node === null:
    return 'null';
  case node === undefined:
    return 'undefined';
  case node instanceof Date:
    return formatDate(node);
  case typeof node === 'symbol':
    return `Symbol('${ node.description }')`;
  case Array.isArray(node):
    return formatArray(node);
  case typeof node === 'object' && node?.constructor.name === 'Object':
    return formatObject(node);
  }

  throw new Error(`Unsupported type: ${ typeof node }`);
};
