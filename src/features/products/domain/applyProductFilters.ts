import { Product } from './models/Product';
import { ProductFilters } from './models/ProductFilters';

/** Pure client-side sort/filter — the product list is small and already in memory. */
export function applyProductFilters(products: Product[], filters: ProductFilters): Product[] {
  const filtered =
    filters.minRating > 0 ? products.filter(product => product.rating >= filters.minRating) : products;

  switch (filters.sortBy) {
    case 'priceAsc':
      return [...filtered].sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return [...filtered].sort((a, b) => b.price - a.price);
    case 'ratingDesc':
      return [...filtered].sort((a, b) => b.rating - a.rating);
    default:
      return filtered;
  }
}
