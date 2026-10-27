import { Listing } from '../../domain/models/Listing';
import { ListingRepository } from '../../domain/repositories/ListingRepository';
import { ListingRemoteDataSource } from '../datasources/ListingRemoteDataSource';
import { mapProductDtoToListing } from '../mappers/ProductMapper';

/** Concrete `ListingRepository`: fetches DTOs and maps them to the domain model. */
export function createListingRepository(
  dataSource: ListingRemoteDataSource,
): ListingRepository {
  return {
    async getListings(signal): Promise<Listing[]> {
      const products = await dataSource.getProducts(signal);
      return products.map(mapProductDtoToListing);
    },
  };
}
