import { Ajv, ValidateFunction } from 'ajv';
import { readFile } from 'node:fs/promises';

const validate: ValidateFunction<Metadata> = new Ajv().compile({
  type: 'object',
  properties: {
    project_name: {
      type: 'string',
    },
    tag: {
      type: 'string',
    },
    previous_tag: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
    commit: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
    runtime: {
      type: 'object',
      properties: {
        goos: {
          type: 'string',
        },
        goarch: {
          type: 'string',
        },
      },
      required: ['goarch', 'goos'],
    },
  },
  required: ['commit', 'date', 'previous_tag', 'project_name', 'runtime', 'tag', 'version'],
});

export const parseMetadata = async (path: string): Promise<Metadata> => {
  const content = await readFile(path, 'utf8');
  const metadata: unknown = JSON.parse(content);

  if (validate(metadata)) {
    return metadata;
  }

  throw new Error((validate.errors ?? [{ message: 'Unknown error' }]).map(p => p.message).join('\n'));
};
