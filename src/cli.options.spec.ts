import type { Argv } from 'yargs';
import {
  builderOption,
  clearOption,
  descriptionOption,
  filesOption,
  keywordsOption,
  licenseOption,
  otpOption,
  prefixOption,
  projectOption,
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
  describe('projectOption', () => {
    it('adds project option with alias p and default "."', () => {
      const { builder, mockOption } = createMockBuilder();
      projectOption(builder);
      expect(mockOption).toHaveBeenCalledWith('project', expect.objectContaining({
        alias: 'p',
        type: 'string',
        default: '.',
      }));
    });
  });

  describe('builderOption', () => {
    it('adds builder option with alias b', () => {
      const { builder, mockOption } = createMockBuilder();
      builderOption(builder);
      expect(mockOption).toHaveBeenCalledWith('builder', expect.objectContaining({
        alias: 'b',
        type: 'string',
      }));
    });
  });

  describe('clearOption', () => {
    it('adds clear option with alias c and default false', () => {
      const { builder, mockOption } = createMockBuilder();
      clearOption(builder);
      expect(mockOption).toHaveBeenCalledWith('clear', expect.objectContaining({
        alias: 'c',
        type: 'boolean',
        default: false,
      }));
    });
  });

  describe('prefixOption', () => {
    it('adds prefix option as string type', () => {
      const { builder, mockOption } = createMockBuilder();
      prefixOption(builder);
      expect(mockOption).toHaveBeenCalledWith('prefix', expect.objectContaining({
        type: 'string',
      }));
    });
  });

  describe('descriptionOption', () => {
    it('adds description option as string type', () => {
      const { builder, mockOption } = createMockBuilder();
      descriptionOption(builder);
      expect(mockOption).toHaveBeenCalledWith('description', expect.objectContaining({
        type: 'string',
      }));
    });
  });

  describe('filesOption', () => {
    it('adds files option as array with default readme/license globs', () => {
      const { builder, mockOption } = createMockBuilder();
      filesOption(builder);
      expect(mockOption).toHaveBeenCalledWith('files', expect.objectContaining({
        type: 'array',
        default: ['readme.md', 'license'],
      }));
    });
  });

  describe('tokenOption', () => {
    it('adds token option as string type', () => {
      const { builder, mockOption } = createMockBuilder();
      tokenOption(builder);
      expect(mockOption).toHaveBeenCalledWith('token', expect.objectContaining({
        type: 'string',
      }));
    });
  });

  describe('otpOption', () => {
    it('adds otp option as string type', () => {
      const { builder, mockOption } = createMockBuilder();
      otpOption(builder);
      expect(mockOption).toHaveBeenCalledWith('otp', expect.objectContaining({
        type: 'string',
      }));
    });
  });

  describe('verboseOption', () => {
    it('adds verbose option with default false', () => {
      const { builder, mockOption } = createMockBuilder();
      verboseOption(builder);
      expect(mockOption).toHaveBeenCalledWith('verbose', expect.objectContaining({
        type: 'boolean',
        default: false,
      }));
    });
  });

  describe('keywordsOption', () => {
    it('adds keywords option as array type', () => {
      const { builder, mockOption } = createMockBuilder();
      keywordsOption(builder);
      expect(mockOption).toHaveBeenCalledWith('keywords', expect.objectContaining({
        type: 'array',
      }));
    });
  });

  describe('licenseOption', () => {
    it('adds license option as string type', () => {
      const { builder, mockOption } = createMockBuilder();
      licenseOption(builder);
      expect(mockOption).toHaveBeenCalledWith('license', expect.objectContaining({
        type: 'string',
      }));
    });
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
