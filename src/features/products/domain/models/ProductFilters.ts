/** How the product list should be sorted. */
export type ProductSortOption = 'default' | 'priceAsc' | 'priceDesc' | 'ratingDesc';

/** User-chosen sort/filter options for the product list, applied client-side. */
export interface ProductFilters {
  sortBy: ProductSortOption;
  /** Minimum rating to show, 0 meaning no filter. */
  minRating: number;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  sortBy: 'default',
  minRating: 0,
};
