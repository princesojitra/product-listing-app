/** Shape of a single entry in DummyJSON's `reviews` array. */
export interface ProductReviewDto {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

function isProductReviewDto(value: unknown): value is ProductReviewDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.rating === 'number' &&
    typeof candidate.comment === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.reviewerName === 'string' &&
    typeof candidate.reviewerEmail === 'string'
  );
}

/** Shape of DummyJSON's `dimensions` object. No unit is documented. */
export interface ProductDimensionsDto {
  width: number;
  height: number;
  depth: number;
}

function isProductDimensionsDto(value: unknown): value is ProductDimensionsDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.width === 'number' &&
    typeof candidate.height === 'number' &&
    typeof candidate.depth === 'number'
  );
}

/** Shape of DummyJSON's `meta` object — catalog record-keeping, not shown in the UI. */
export interface ProductMetaDto {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

function isProductMetaDto(value: unknown): value is ProductMetaDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.barcode === 'string' &&
    typeof candidate.qrCode === 'string'
  );
}

/**
 * Shape of the single-product response from DummyJSON's details endpoint
 * (`/products/{id}`). This is a genuinely different contract from the list
 * endpoint's `ProductDto` — it carries the full set of fields DummyJSON
 * returns for one product, including fields the list endpoint never returns
 * (`brand`, `stock`, `tags`, `discountPercentage`, `availabilityStatus`,
 * a full `images` gallery, and the richer set below).
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
  sku: string;
  /** DummyJSON does not document a unit for this field. */
  weight: number;
  dimensions: ProductDimensionsDto;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReviewDto[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMetaDto;
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
    typeof candidate.sku === 'string' &&
    typeof candidate.weight === 'number' &&
    isProductDimensionsDto(candidate.dimensions) &&
    typeof candidate.warrantyInformation === 'string' &&
    typeof candidate.shippingInformation === 'string' &&
    typeof candidate.availabilityStatus === 'string' &&
    Array.isArray(candidate.reviews) &&
    candidate.reviews.every(isProductReviewDto) &&
    typeof candidate.returnPolicy === 'string' &&
    typeof candidate.minimumOrderQuantity === 'number' &&
    isProductMetaDto(candidate.meta) &&
    Array.isArray(candidate.images) &&
    typeof candidate.thumbnail === 'string'
  );
}
