import { Product } from '../models/Product';
import { ProductDetails } from '../models/ProductDetails';

/**
 * Domain contract for loading products. The domain/presentation layers
 * depend on this interface only — never on the data layer directly — so a
 * test can supply a plain object implementation without touching the
 * network. `getProductById` returns `ProductDetails`, not `Product`: the
 * details endpoint is a genuinely richer contract (brand, stock, discount,
 * a full image gallery), not just a single-item version of the list.
 */
export interface ProductRepository {
  getProducts(signal?: AbortSignal): Promise<Product[]>;
  getProductById(id: string, signal?: AbortSignal): Promise<ProductDetails>;
}
