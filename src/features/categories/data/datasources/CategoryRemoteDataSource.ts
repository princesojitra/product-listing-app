import { HttpClient } from '../../../../core/network/HttpClient';
import { isAbortError } from '../../../../core/errors/isAbortError';
import { CategoryDto, isCategoryDto } from '../dto/CategoryDto';

const CATEGORIES_URL = 'https://dummyjson.com/products/categories';

/** Talks HTTP and validates the DummyJSON response shape; returns raw DTOs. */
export interface CategoryRemoteDataSource {
  getCategories(signal?: AbortSignal): Promise<CategoryDto[]>;
}

/**
 * Rejects with the original abort error (name === 'AbortError') on
 * cancellation so callers can distinguish a cancelled request from a
 * genuine failure; never silently returns an empty list when the request
 * actually failed.
 */
export function createCategoryRemoteDataSource(
  httpClient: HttpClient,
): CategoryRemoteDataSource {
  return {
    async getCategories(signal) {
      let response: Response;
      try {
        response = await httpClient.fetch(CATEGORIES_URL, { signal });
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

      if (!Array.isArray(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      const validCategories = data.filter(isCategoryDto);

      if (validCategories.length === 0 && data.length > 0) {
        throw new Error(
          'The server response did not contain any valid categories.',
        );
      }

      return validCategories;
    },
  };
}
