import { fetchHttpClient } from '../core/network/FetchHttpClient';
import {
  ListingRepository,
  createListingRemoteDataSource,
  createListingRepository,
} from '../features/listings';

/**
 * Application composition root. Wires concrete implementations to the
 * interfaces the domain/presentation layers depend on, in dependency order:
 * HTTP client -> remote data source -> repository.
 *
 * Nothing outside this file should import the concrete data-layer pieces
 * (`FetchHttpClient`, `ListingRemoteDataSource`, `ListingRepositoryImpl`)
 * directly — consumers take `ListingRepository` as a parameter instead.
 */
const listingRemoteDataSource = createListingRemoteDataSource(fetchHttpClient);
const listingRepository: ListingRepository = createListingRepository(
  listingRemoteDataSource,
);

export const container = {
  listingRepository,
};
