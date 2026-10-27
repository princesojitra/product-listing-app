import { HttpClient } from '../../../../src/core/network/HttpClient';
import { createListingRemoteDataSource } from '../../../../src/features/listings/data/datasources/ListingRemoteDataSource';
import { createListingRepository } from '../../../../src/features/listings/data/repositories/ListingRepositoryImpl';

function mockHttpClient(
  response: Partial<Response> & { json?: () => Promise<unknown> },
): HttpClient {
  return { fetch: jest.fn().mockResolvedValue(response as Response) };
}

function repositoryFor(httpClient: HttpClient) {
  return createListingRepository(createListingRemoteDataSource(httpClient));
}

const sampleProductDto = {
  id: 1,
  title: 'Essence Mascara Lash Princess',
  description: 'The Essence Mascara Lash Princess is a popular mascara.',
  price: 9.99,
  category: 'beauty',
  rating: 4.94,
  thumbnail: 'https://dummyjson.com/images/products/1/thumbnail.webp',
};

describe('ListingRepository (data source + mapper)', () => {
  it('maps a successful response into Listing[]', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({
        products: [
          sampleProductDto,
          { ...sampleProductDto, id: 2, title: 'Second product' },
        ],
        total: 2,
        skip: 0,
        limit: 10,
      }),
    });

    const listings = await repositoryFor(httpClient).getListings();

    expect(listings).toHaveLength(2);
    expect(listings[0]).toEqual({
      id: '1',
      title: 'Essence Mascara Lash Princess',
      description: sampleProductDto.description,
      price: 9.99,
      category: 'beauty',
      rating: 4.94,
      imageUrl: sampleProductDto.thumbnail,
    });
    expect(listings[1]).toMatchObject({ id: '2', title: 'Second product' });
  });

  it('throws when the HTTP response is not ok', async () => {
    const httpClient = mockHttpClient({
      ok: false,
      status: 500,
      json: async () => ({ products: [] }),
    });

    await expect(repositoryFor(httpClient).getListings()).rejects.toThrow(/500/);
  });

  it('throws on a malformed (non-array products) response body', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ not: 'a products list' }),
    });

    await expect(repositoryFor(httpClient).getListings()).rejects.toThrow(
      /unexpected response format/i,
    );
  });

  it('throws when none of the returned items are valid products', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ products: [{ foo: 'bar' }, { id: 'not-a-number' }] }),
    });

    await expect(repositoryFor(httpClient).getListings()).rejects.toThrow(
      /did not contain any valid/i,
    );
  });

  it('wraps a network failure in a user-facing error', async () => {
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    };

    await expect(repositoryFor(httpClient).getListings()).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(abortError),
    };

    await expect(repositoryFor(httpClient).getListings()).rejects.toBe(abortError);
  });
});
