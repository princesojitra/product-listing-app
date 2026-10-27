/**
 * Shape of the single-product response from DummyJSON's details endpoint
 * (`/products/{id}`). This is a genuinely different contract from the list
 * endpoint's `ProductDto` — it carries fields (`brand`, `stock`, `tags`,
 * `discountPercentage`, `availabilityStatus`, a full `images` gallery) that
 * `/products` never returns. Fields with no corresponding UI use —
 * `sku`, `weight`, `dimensions`, `warrantyInformation`, `shippingInformation`,
 * `returnPolicy`, `minimumOrderQuantity`, `reviews`, `meta` — are left
 * unmodeled rather than carried around unused.
 */
export interface ProductDetailsDto {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  /** DummyJSON omits this for some categories (e.g. groceries). */
  brand?: string;
  availabilityStatus: string;
  images: string[];
  thumbnail: string;
}

/**
 * Runtime guard for the details response. `fetch`/`JSON.parse` return
 * `unknown` data at the network boundary, so a type assertion alone would
 * let a malformed payload silently masquerade as a valid `ProductDetailsDto`.
 */
export function isProductDetailsDto(value: unknown): value is ProductDetailsDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.discountPercentage === 'number' &&
    typeof candidate.rating === 'number' &&
    typeof candidate.stock === 'number' &&
    Array.isArray(candidate.tags) &&
    (candidate.brand === undefined || typeof candidate.brand === 'string') &&
    typeof candidate.availabilityStatus === 'string' &&
    Array.isArray(candidate.images) &&
    typeof candidate.thumbnail === 'string'
  );
}
