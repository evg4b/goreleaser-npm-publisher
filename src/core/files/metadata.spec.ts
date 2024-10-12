/* eslint-disable @typescript-eslint/no-floating-promises */
const readFileMock = jest.fn()
  .mockName('readFileMock');

jest.mock('node:fs/promises', () => ({
  readFile: readFileMock,
}));

const metadataContent = `{
    "project_name": "go_package",
    "tag": "v1.1.0",
    "previous_tag": "v1.0.99",
    "version": "1.1.0",
    "commit": "96a17ce8bc12f02367c710fe08fe9250c134fb71",
    "date": "2024-10-12T18:41:52.365458-03:00",
    "runtime": {
        "goos": "darwin",
        "goarch": "arm64"
    }
}`;

import { parseMetadata } from './metadata';

describe('parseMetadata', () => {
  it('should return parsed content', async () => {
    readFileMock.mockResolvedValueOnce(metadataContent);

    const artifact = await parseMetadata(`/dist/artifacts.json`);

    expect(artifact).toEqual({
      "project_name": "go_package",
      "tag": "v1.1.0",
      "previous_tag": "v1.0.99",
      "version": "1.1.0",
      "commit": "96a17ce8bc12f02367c710fe08fe9250c134fb71",
      "date": "2024-10-12T18:41:52.365458-03:00",
      "runtime": {
        "goos": "darwin",
        "goarch": "arm64"
      }
    });
  });

  it('should throw an error if the given invalid file', () => {
    readFileMock.mockResolvedValueOnce(`{ "name": "test" }`);

    expect(parseMetadata(`/dist/artifacts.json`))
      .rejects.toThrow(Error);
  });
});
