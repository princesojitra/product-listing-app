import { HttpClient } from '../../../../src/core/network/HttpClient';
import { createProductRemoteDataSource } from '../../../../src/features/products/data/datasources/ProductRemoteDataSource';
import { createProductRepository } from '../../../../src/features/products/data/repositories/ProductRepositoryImpl';

function mockHttpClient(
  response: Partial<Response> & { json?: () => Promise<unknown> },
): HttpClient {
  return { fetch: jest.fn().mockResolvedValue(response as Response) };
}

function repositoryFor(httpClient: HttpClient) {
  return createProductRepository(createProductRemoteDataSource(httpClient));
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

const sampleProductDetailsDto = {
  ...sampleProductDto,
  discountPercentage: 10.48,
  stock: 99,
  tags: ['beauty', 'mascara'],
  brand: 'Essence',
  availabilityStatus: 'In Stock',
  images: ['https://cdn.dummyjson.com/product-images/beauty/essence/1.webp'],
};

describe('ProductRepository.getProducts (data source + mapper)', () => {
  it('maps a successful response into Product[]', async () => {
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

    const products = await repositoryFor(httpClient).getProducts();

    expect(products).toHaveLength(2);
    expect(products[0]).toEqual({
      id: '1',
      title: 'Essence Mascara Lash Princess',
      description: sampleProductDto.description,
      price: 9.99,
      category: 'beauty',
      rating: 4.94,
      imageUrl: sampleProductDto.thumbnail,
    });
    expect(products[1]).toMatchObject({ id: '2', title: 'Second product' });
  });

  it('throws when the HTTP response is not ok', async () => {
    const httpClient = mockHttpClient({
      ok: false,
      status: 500,
      json: async () => ({ products: [] }),
    });

    await expect(repositoryFor(httpClient).getProducts()).rejects.toThrow(/500/);
  });

  it('throws on a malformed (non-array products) response body', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ not: 'a products list' }),
    });

    await expect(repositoryFor(httpClient).getProducts()).rejects.toThrow(
      /unexpected response format/i,
    );
  });

  it('throws when none of the returned items are valid products', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ products: [{ foo: 'bar' }, { id: 'not-a-number' }] }),
    });

    await expect(repositoryFor(httpClient).getProducts()).rejects.toThrow(
      /did not contain any valid/i,
    );
  });

  it('wraps a network failure in a user-facing error', async () => {
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    };

    await expect(repositoryFor(httpClient).getProducts()).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(abortError),
    };

    await expect(repositoryFor(httpClient).getProducts()).rejects.toBe(abortError);
  });
});

describe('ProductRepository.getProductById (data source + mapper)', () => {
  it('requests the correct details URL and maps the richer details response into a ProductDetails', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => sampleProductDetailsDto,
    });

    const product = await repositoryFor(httpClient).getProductById('1');

    expect(httpClient.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/products/1',
      expect.objectContaining({ signal: undefined }),
    );
    expect(product).toEqual({
      id: '1',
      title: 'Essence Mascara Lash Princess',
      description: sampleProductDetailsDto.description,
      category: 'beauty',
      price: 9.99,
      discountPercentage: 10.48,
      rating: 4.94,
      brand: 'Essence',
      stock: 99,
      availabilityStatus: 'In Stock',
      tags: ['beauty', 'mascara'],
      imageUrl: sampleProductDetailsDto.images[0],
      images: sampleProductDetailsDto.images,
    });
  });

  it('falls back to the thumbnail when the details response has no images', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ ...sampleProductDetailsDto, images: [] }),
    });

    const product = await repositoryFor(httpClient).getProductById('1');

    expect(product.imageUrl).toBe(sampleProductDetailsDto.thumbnail);
  });

  it('maps a missing brand to null rather than fabricating one', async () => {
    const detailsWithoutBrand: Partial<typeof sampleProductDetailsDto> = {
      ...sampleProductDetailsDto,
    };
    delete detailsWithoutBrand.brand;
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => detailsWithoutBrand,
    });

    const product = await repositoryFor(httpClient).getProductById('1');

    expect(product.brand).toBeNull();
  });

  it('rejects an invalid id without making a request', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => sampleProductDetailsDto,
    });

    await expect(repositoryFor(httpClient).getProductById('not-an-id')).rejects.toThrow(
      /invalid product id/i,
    );
    await expect(repositoryFor(httpClient).getProductById('')).rejects.toThrow(
      /invalid product id/i,
    );
    expect(httpClient.fetch).not.toHaveBeenCalled();
  });

  it('throws on an HTTP 404', async () => {
    const httpClient = mockHttpClient({ ok: false, status: 404, json: async () => ({}) });

    await expect(repositoryFor(httpClient).getProductById('999')).rejects.toThrow(/404/);
  });

  it('throws when the response body is not a valid product (e.g. a not-found message)', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => ({ message: "Product with id '999' not found" }),
    });

    await expect(repositoryFor(httpClient).getProductById('999')).rejects.toThrow(
      /unexpected response format/i,
    );
  });

  it('throws on malformed JSON', async () => {
    const httpClient = mockHttpClient({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('bad json');
      },
    });

    await expect(repositoryFor(httpClient).getProductById('1')).rejects.toThrow(
      /could not be read/i,
    );
  });

  it('wraps a network failure in a user-facing error', async () => {
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    };

    await expect(repositoryFor(httpClient).getProductById('1')).rejects.toThrow(
      /could not reach the server/i,
    );
  });

  it('preserves cancellation errors instead of wrapping them', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    const httpClient: HttpClient = {
      fetch: jest.fn().mockRejectedValue(abortError),
    };

    await expect(repositoryFor(httpClient).getProductById('1')).rejects.toBe(abortError);
  });
});
