/**
 * Domain/UI model for a single product's full details. Deliberately
 * separate from `Product` (the list-row model): the details endpoint
 * returns a richer contract (brand, stock, discount, a full image gallery),
 * and this model carries exactly that — not real-estate attributes that
 * don't exist in the underlying DummyJSON product data.
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
  stock: number;
  availabilityStatus: string;
  tags: string[];
  /** First image from the gallery (falls back to `thumbnail` if empty). */
  imageUrl: string;
  images: string[];
}
