import { Listing } from '../../features/listings';

/**
 * Centralized route parameter list for the root stack. The details route
 * carries the already-fetched domain `Listing`, not a DTO or an id that
 * would require a second network request.
 */
export type RootStackParamList = {
  Listings: undefined;
  PropertyDetails: { listing: Listing };
};
