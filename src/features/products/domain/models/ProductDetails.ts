/** A single customer review, shown on the product details screen. */
export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

/** A product's physical dimensions. DummyJSON documents no unit for these. */
export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

/**
 * Domain/UI model for a single product's full details. Deliberately
 * separate from `Product` (the list-row model): the details endpoint
 * returns a richer contract (brand, stock, discount, a full image gallery,
 * logistics/warranty info, reviews), and this model carries exactly that —
 * not real-estate attributes that don't exist in the underlying DummyJSON
 * product data. DummyJSON's `meta` envelope (created/updated timestamps,
 * barcode, QR code) is catalog record-keeping, not shown to the shopper,
 * so it is intentionally not modeled here.
 */
export interface ProductDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  /** `null` when DummyJSON omits brand for this product's category. */
  brand: string | null;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  stock: number;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  tags: string[];
  reviews: ProductReview[];
  /** First image from the gallery (falls back to `thumbnail` if empty). */
  imageUrl: string;
  images: string[];
}
