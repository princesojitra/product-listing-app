import { HttpClient } from '../../../../core/network/HttpClient';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { ProductDetailsDto, isProductDetailsDto } from '../dto/ProductDetailsDto';
import {
  ProductDto,
  isProductDto,
  isProductsResponseDto,
} from '../dto/ProductDto';

const PRODUCTS_URL = 'https://dummyjson.com/products';
const LIST_URL = `${PRODUCTS_URL}?limit=10`;

/** DummyJSON product ids are positive integers; reject anything else up front. */
function isValidProductId(id: string): boolean {
  return /^\d+$/.test(id);
}

/** Category slugs come from the categories API, not free user text, but an
 * empty/whitespace value would still build a malformed URL. */
function isValidCategorySlug(slug: string): boolean {
  return slug.trim().length > 0;
}

/** One page of products plus the total number of matches, for pagination. */
export interface ProductsPageDto {
  products: ProductDto[];
  total: number;
}

/** Talks HTTP and validates the DummyJSON response shape; returns raw DTOs. */
export interface ProductRemoteDataSource {
  getProducts(signal?: AbortSignal): Promise<ProductDto[]>;
  getProductById(id: string, signal?: AbortSignal): Promise<ProductDetailsDto>;
  getProductsByCategory(
    categorySlug: string,
    limit: number,
    skip: number,
    signal?: AbortSignal,
  ): Promise<ProductsPageDto>;
}

/**
 * Shared by `getProducts` and `getProductsByCategory`: both hit DummyJSON
 * endpoints returning the same `{products, total, skip, limit}` envelope,
 * differing only in the URL. Returns `total` alongside the validated
 * products so paginated callers (`getProductsByCategory`) know whether more
 * pages are available; callers that don't paginate (`getProducts`) just
 * ignore it.
 */
async function fetchProductsList(
  httpClient: HttpClient,
  url: string,
  signal?: AbortSignal,
): Promise<ProductsPageDto> {
  let response: Response;
  try {
    response = await httpClient.fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new Error(
      'Could not reach the server. Please check your connection and try again.',
    );
  }

  // fetch() only rejects on network failure — an HTTP error status like
  // 404 or 500 still resolves successfully, so response.ok must be
  // checked explicitly.
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned a response that could not be read.');
  }

  if (!isProductsResponseDto(data)) {
    throw new Error('The server returned an unexpected response format.');
  }

  const validProducts = data.products.filter(isProductDto);

  if (validProducts.length === 0 && data.products.length > 0) {
    throw new Error('The server response did not contain any valid products.');
  }

  return { products: validProducts, total: data.total };
}

/**
 * Rejects with the original abort error (name === 'AbortError') on
 * cancellation so callers can distinguish a cancelled request from a
 * genuine failure; never silently returns an empty list when the request
 * actually failed.
 */
export function createProductRemoteDataSource(
  httpClient: HttpClient,
): ProductRemoteDataSource {
  return {
    async getProducts(signal) {
      const { products } = await fetchProductsList(httpClient, LIST_URL, signal);
      return products;
    },

    getProductsByCategory(categorySlug, limit, skip, signal) {
      if (!isValidCategorySlug(categorySlug)) {
        return Promise.reject(new Error('Invalid category.'));
      }
      const url = `${PRODUCTS_URL}/category/${encodeURIComponent(
        categorySlug,
      )}?limit=${limit}&skip=${skip}`;
      return fetchProductsList(httpClient, url, signal);
    },

    async getProductById(id, signal) {
      if (!isValidProductId(id)) {
        throw new Error('Invalid product id.');
      }

      let response: Response;
      try {
        response = await httpClient.fetch(`${PRODUCTS_URL}/${id}`, { signal });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        throw new Error(
          'Could not reach the server. Please check your connection and try again.',
        );
      }

      // DummyJSON returns a real 404 for most invalid ids, but some
      // responses come back 200 with an error-shaped body instead — the
      // isProductDetailsDto check below catches that case too.
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          'The server returned a response that could not be read.',
        );
      }

      if (!isProductDetailsDto(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      return data;
    },
  };
}
