import { HttpClient } from '../../../../src/core/network/HttpClient';
import { createCategoryRemoteDataSource } from '../../../../src/features/categories/data/datasources/CategoryRemoteDataSource';
import { createCategoryRepository } from '../../../../src/features/categories/data/repositories/CategoryRepositoryImpl';

function mockHttpClient(
  response: Partial<Response> & { json?: () => Promise<unknown> },
): HttpClient {
  return { fetch: jest.fn().mockResolvedValue(response as Response) };
}

function repositoryFor(httpClient: HttpClient) {
  return createCategoryRepository(createCategoryRemoteDataSource(httpClient));
}

const sampleCategoryDto = {
  slug: 'beauty',
  name: 'Beauty',
  url: 'https://dummyjson.com/products/category/beauty',
};

describe('CategoryRepository (data source + mapper)', () => {
  it('maps a successful response into Category[], requesting the categories endpoint', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => [
        sampleCategoryDto,
        { slug: 'fragrances', name: 'Fragrances', url: 'https://dummyjson.com/products/category/fragrances' },
      ],
    });

    const categories = await repositoryFor(httpClient).getCategories();

    expect(httpClient.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/products/categories',
      expect.objectContaining({ signal: undefined }),
    );
    expect(categories).toEqual([
      { slug: 'beauty', name: 'Beauty' },
      { slug: 'fragrances', name: 'Fragrances' },
    ]);
  });

  it('throws when the HTTP response is not ok', async () => {
    const httpClient = mockHttpClient({ ok: false, status: 500, json: async () => [] });

    await expect(repositoryFor(httpClient).getCategories()).rejects.toThrow(/500/);
  });

  it('throws on a malformed (non-array) response body', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ not: 'an array' }),
    });

    await expect(repositoryFor(httpClient).getCategories()).rejects.toThrow(
      /unexpected response format/i,
    );
  });

  it('throws when none of the returned items are valid categories', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => [{ foo: 'bar' }, { slug: '' }],
    });

    await expect(repositoryFor(httpClient).getCategories()).rejects.toThrow(
      /did not contain any valid/i,
    );
  });

  it('wraps a network failure in a user-facing error', async () => {
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    };

    await expect(repositoryFor(httpClient).getCategories()).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(abortError),
    };

    await expect(repositoryFor(httpClient).getCategories()).rejects.toBe(abortError);
  });
});
