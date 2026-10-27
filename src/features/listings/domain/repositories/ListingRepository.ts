import { Listing } from '../models/Listing';

/**
 * Domain contract for loading listings. The presentation layer depends on
 * this interface only — never on the data layer directly — so a test can
 * supply a plain object implementation without touching the network.
 */
export interface ListingRepository {
  getListings(signal?: AbortSignal): Promise<Listing[]>;
}
