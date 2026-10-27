import { applyProductFilters } from '../../../../src/features/products/domain/applyProductFilters';
import { Product } from '../../../../src/features/products/domain/models/Product';

function product(overrides: Partial<Product>): Product {
  return {
    id: '1',
    title: 'Item',
    description: '',
    price: 10,
    category: 'beauty',
    rating: 3,
    imageUrl: '',
    ...overrides,
  };
}

describe('applyProductFilters', () => {
  const products = [
    product({ id: '1', price: 30, rating: 4.5 }),
    product({ id: '2', price: 10, rating: 2 }),
    product({ id: '3', price: 20, rating: 3.8 }),
  ];

  it('returns the list unchanged for the default filters', () => {
    expect(applyProductFilters(products, { sortBy: 'default', minRating: 0 })).toEqual(products);
  });

  it('sorts by price ascending', () => {
    const result = applyProductFilters(products, { sortBy: 'priceAsc', minRating: 0 });
    expect(result.map(p => p.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by price descending', () => {
    const result = applyProductFilters(products, { sortBy: 'priceDesc', minRating: 0 });
    expect(result.map(p => p.id)).toEqual(['1', '3', '2']);
  });

  it('sorts by rating descending', () => {
    const result = applyProductFilters(products, { sortBy: 'ratingDesc', minRating: 0 });
    expect(result.map(p => p.id)).toEqual(['1', '3', '2']);
  });

  it('filters out products below the minimum rating', () => {
    const result = applyProductFilters(products, { sortBy: 'default', minRating: 4 });
    expect(result.map(p => p.id)).toEqual(['1']);
  });

  it('combines a minimum rating with a sort', () => {
    const result = applyProductFilters(products, { sortBy: 'priceAsc', minRating: 3 });
    expect(result.map(p => p.id)).toEqual(['3', '1']);
  });

  it('does not mutate the original array', () => {
    const original = [...products];
    applyProductFilters(products, { sortBy: 'priceAsc', minRating: 0 });
    expect(products).toEqual(original);
  });
});
