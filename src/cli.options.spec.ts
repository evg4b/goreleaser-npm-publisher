import type { Argv } from 'yargs';
import {
  binOption,
  builderOption,
  clearOption,
  descriptionOption,
  filesOption,
  keywordsOption,
  licenseOption,
  nameOption,
  otpOption,
  prefixOption,
  projectOption,
  repositoryDirectoryOption,
  repositoryOption,
  repositoryTypeOption,
  tokenOption,
  verboseOption,
} from './cli.options';

const createMockBuilder = () => {
  const mockOption = jest.fn();
  const builder = { option: mockOption } as unknown as Argv;
  mockOption.mockReturnValue(builder);
  return { builder, mockOption };
};

describe('cli options', () => {
  it.each([
    ['projectOption', projectOption, 'project', { alias: 'p', type: 'string', default: '.' }],
    ['builderOption', builderOption, 'builder', { alias: 'b', type: 'string' }],
    ['nameOption', nameOption, 'name', { alias: 'n', type: 'string' }],
    ['binOption', binOption, 'bin', { type: 'string' }],
    ['repositoryOption', repositoryOption, 'repository', { type: 'string' }],
    [
      'repositoryTypeOption',
      repositoryTypeOption,
      'repository-type',
      { type: 'string', choices: ['git', 'svn', 'hg', 'bzr'] },
    ],
    ['repositoryDirectoryOption', repositoryDirectoryOption, 'repository-directory', { type: 'string' }],
    ['clearOption', clearOption, 'clear', { alias: 'c', type: 'boolean', default: false }],
    ['prefixOption', prefixOption, 'prefix', { type: 'string' }],
    ['descriptionOption', descriptionOption, 'description', { type: 'string' }],
    ['filesOption', filesOption, 'files', { type: 'array', default: ['readme.md', 'license'] }],
    ['tokenOption', tokenOption, 'token', { type: 'string' }],
    ['otpOption', otpOption, 'otp', { type: 'string' }],
    ['verboseOption', verboseOption, 'verbose', { type: 'boolean', default: false }],
    ['keywordsOption', keywordsOption, 'keywords', { type: 'array' }],
    ['licenseOption', licenseOption, 'license', { type: 'string' }],
  ] as const)('%s adds the "%s" option with the expected settings', (_label, optionFn, flag, expected) => {
    const { builder, mockOption } = createMockBuilder();

    optionFn(builder);

    expect(mockOption).toHaveBeenCalledWith(flag, expect.objectContaining(expected));
  });

  describe('option builders return builder for chaining', () => {
    it.each([
      ['projectOption', projectOption] as const,
      ['builderOption', builderOption] as const,
      ['clearOption', clearOption] as const,
      ['prefixOption', prefixOption] as const,
      ['descriptionOption', descriptionOption] as const,
      ['filesOption', filesOption] as const,
      ['tokenOption', tokenOption] as const,
      ['otpOption', otpOption] as const,
      ['verboseOption', verboseOption] as const,
      ['keywordsOption', keywordsOption] as const,
      ['licenseOption', licenseOption] as const,
    ])('%s returns the builder', (_name, optionFn) => {
      const { builder } = createMockBuilder();
      const result = optionFn(builder);
      expect(result).toBe(builder);
    });
  });
});
