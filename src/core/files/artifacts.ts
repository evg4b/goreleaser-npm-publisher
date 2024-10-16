import { Ajv, ValidateFunction } from 'ajv';
import { readFile } from '../../helpers/fs';
import { FileFormatError } from './error';

const validate: ValidateFunction<Artifact[]> = new Ajv().compile({
  items: {
    type: 'object',
    additionalProperties: true,
    properties: {
      name: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      internal_type: {
        type: 'integer',
      },
      type: {
        type: 'string',
      },
      goos: {
        type: 'string',
      },
      goarch: {
        type: 'string',
      },
      extra: {
        type: 'object',
        additionalProperties: true,
        properties: {
          Binary: {
            type: 'string',
          },
          Ext: {
            type: 'string',
          },
          ID: {
            type: 'string',
          },
        },
        required: ['Binary', 'Ext', 'ID'],
      },
      goamd64: {
        type: 'string',
      },
    },
    required: ['internal_type', 'name', 'path', 'type'],
  },
  type: 'array',
});

export const parseArtifactsFile = async (path: string): Promise<Artifact[]> => {
  const artifacts: unknown = JSON.parse(await readFile(path));

  if (validate(artifacts)) {
    return artifacts;
  }

  throw new FileFormatError(validate.errors);
};
