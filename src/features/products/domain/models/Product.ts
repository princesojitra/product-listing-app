/**
 * Domain/UI model used throughout the app. Decoupled from the external
 * API's response shape so that API changes don't ripple into the UI.
 *
 * Backed by DummyJSON product data (not real estate listings), so fields
 * with no equivalent in that data (location, bedrooms) are not present.
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  imageUrl: string;
}
