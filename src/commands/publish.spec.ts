const mockBuildHandler = jest.fn();
jest.mock('./build', () => ({ buildHandler: mockBuildHandler }));

const mockReaddir = jest.fn();
jest.mock('node:fs/promises', () => ({ readdir: mockReaddir }));

const mockPublish = jest.fn();
jest.mock('../npm', () => ({ publish: mockPublish }));

const mockLoggerInfo = jest.fn();
const mockLoggerGroup = jest.fn();
jest.mock('../core/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    debug: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    group: mockLoggerGroup,
  },
}));

const mockContextInstance = {
  artifactsPath: '/project/dist/artifacts.json',
  metadataPath: '/project/dist/metadata.json',
  distPath: '/project/dist/npm',
  packageFolder: jest.fn().mockImplementation((name: string) => `/project/dist/npm/${name}`),
};
jest.mock('../core/gorealiser', () => ({
  Context: jest.fn().mockImplementation(() => mockContextInstance),
}));

import { publishHandler } from './publish';

const makePublishResponse = (overrides = {}) => ({
  id: 'tool@1.0.0',
  name: 'tool',
  version: '1.0.0',
  size: 1024,
  unpackedSize: 2048,
  shasum: 'abc123',
  integrity: 'sha512-abc',
  filename: 'tool-1.0.0.tgz',
  files: [{ path: 'package.json', size: 100, mode: 0o644 }],
  entryCount: 1,
  bundled: [],
  ...overrides,
});

const makeArgs = (overrides: Partial<PublishParams> = {}): PublishParams => ({
  project: '/project',
  builder: 'default',
  clear: false,
  files: [],
  description: undefined,
  prefix: undefined,
  verbose: false,
  license: undefined,
  keywords: [],
  token: undefined,
  otp: undefined,
  ...overrides,
});

describe('publishHandler', () => {
  beforeEach(() => {
    mockBuildHandler.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue(['tool-linux-x64', 'tool-darwin-arm64', 'tool']);
    mockPublish.mockResolvedValue(makePublishResponse());
    mockLoggerGroup.mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  });

  it('calls buildHandler before publishing', async () => {
    await publishHandler(makeArgs());

    expect(mockBuildHandler).toHaveBeenCalledWith(makeArgs());
  });

  it('reads dist directory for packages to publish', async () => {
    await publishHandler(makeArgs());

    expect(mockReaddir).toHaveBeenCalledWith(mockContextInstance.distPath);
  });

  it('publishes each package folder', async () => {
    await publishHandler(makeArgs());

    expect(mockPublish).toHaveBeenCalledTimes(3);
  });

  it('passes token to publish', async () => {
    await publishHandler(makeArgs({ token: 'my-token' }));

    expect(mockPublish).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ token: 'my-token' }),
    );
  });

  it('passes otp to publish', async () => {
    await publishHandler(makeArgs({ otp: '123456' }));

    expect(mockPublish).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ otp: '123456' }),
    );
  });

  it('logs package folder path before publishing', async () => {
    await publishHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('/project/dist/npm/'));
  });

  it('logs published package info', async () => {
    await publishHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('Name:'));
    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('Version:'));
    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('Size:'));
  });

  it('logs file info for each published file', async () => {
    await publishHandler(makeArgs());

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('Size:'));
    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('Mode:'));
  });

  it('publishes packages sorted by name length descending', async () => {
    mockReaddir.mockResolvedValue(['tool', 'tool-linux-x64', 'tool-darwin-arm64']);

    await publishHandler(makeArgs());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const calls = mockPublish.mock.calls.map(call => call[0] as string);
    expect(calls[0]).toContain('tool-darwin-arm64');
    expect(calls[1]).toContain('tool-linux-x64');
    expect(calls[2]).toContain('tool');
  });
});
