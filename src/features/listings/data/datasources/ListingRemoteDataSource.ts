import { HttpClient } from '../../../../core/network/HttpClient';
import { isAbortError } from '../../../../core/errors/isAbortError';
import {
  ProductDto,
  isProductDto,
  isProductsResponseDto,
} from '../dto/ProductDto';

const API_URL = 'https://dummyjson.com/products?limit=10';

/** Talks HTTP and validates the DummyJSON response shape; returns raw DTOs. */
export interface ListingRemoteDataSource {
  getProducts(signal?: AbortSignal): Promise<ProductDto[]>;
}

/**
 * Rejects with the original abort error (name === 'AbortError') on
 * cancellation so callers can distinguish a cancelled request from a
 * genuine failure; never silently returns an empty list when the request
 * actually failed.
 */
export function createListingRemoteDataSource(
  httpClient: HttpClient,
): ListingRemoteDataSource {
  return {
    async getProducts(signal) {
      let response: Response;
      try {
        response = await httpClient.fetch(API_URL, { signal });
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
        throw new Error(
          'The server returned a response that could not be read.',
        );
      }

      if (!isProductsResponseDto(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      const validProducts = data.products.filter(isProductDto);

      if (validProducts.length === 0 && data.products.length > 0) {
        throw new Error(
          'The server response did not contain any valid products.',
        );
      }

      return validProducts;
    },
  };
}
