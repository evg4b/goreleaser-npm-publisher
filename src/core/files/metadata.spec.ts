import '@mocks/helpers/fs';

import { readFile } from '@helpers/fs';
import { parseMetadata } from './metadata';

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

describe('parseMetadata', () => {
  it('should return parsed content', async () => {
    jest.mocked(readFile).mockResolvedValueOnce(metadataContent);

    const artifact = await parseMetadata(`/dist/artifacts.json`);

    expect(artifact).toEqual({
      project_name: 'go_package',
      tag: 'v1.1.0',
      previous_tag: 'v1.0.99',
      version: '1.1.0',
      commit: '96a17ce8bc12f02367c710fe08fe9250c134fb71',
      date: '2024-10-12T18:41:52.365458-03:00',
      runtime: {
        goos: 'darwin',
        goarch: 'arm64',
      },
    });
  });

  it('should throw an error if the given invalid file', async () => {
    jest.mocked(readFile).mockResolvedValueOnce(`{ "name": "test" }`);

    await expect(parseMetadata(`/dist/artifacts.json`)).rejects.toThrow(Error);
  });
});
