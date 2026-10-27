/** Shape of a single item returned by DummyJSON's list endpoint (`/products`). */
export interface ProductDto {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  thumbnail: string;
}

export interface ProductsResponseDto {
  products: ProductDto[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Runtime guard for a single list-item DTO. `fetch`/`JSON.parse` return
 * `unknown` data at the network boundary, so a type assertion alone would
 * let a malformed payload silently masquerade as a valid `ProductDto`.
 */
export function isProductDto(value: unknown): value is ProductDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.category === 'string' &&
    typeof candidate.rating === 'number' &&
    typeof candidate.thumbnail === 'string'
  );
}

/**
 * Runtime guard for the top-level `/products` response envelope. `total` is
 * validated (not just `products`) because paginated callers rely on it to
 * know whether more pages are available.
 */
export function isProductsResponseDto(
  value: unknown,
): value is { products: unknown[]; total: number } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.products) && typeof candidate.total === 'number';
}
