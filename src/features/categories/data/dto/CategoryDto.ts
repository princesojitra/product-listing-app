/**
 * Shape of a single item returned by DummyJSON's categories endpoint
 * (`/products/categories`). The endpoint returns a bare array of these,
 * not wrapped in an envelope the way `/products` wraps its list.
 */
export interface CategoryDto {
  slug: string;
  name: string;
  url: string;
}

/**
 * Runtime guard for a single category DTO. `fetch`/`JSON.parse` return
 * `unknown` data at the network boundary, so a type assertion alone would
 * let a malformed payload silently masquerade as a valid `CategoryDto`.
 */
export function isCategoryDto(value: unknown): value is CategoryDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.slug === 'string' &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    typeof candidate.url === 'string'
  );
}
