import { Product } from '../models/Product';
import { ProductDetails } from '../models/ProductDetails';
import { ProductsPage } from '../models/ProductsPage';

/**
 * Domain contract for loading products. The domain/presentation layers
 * depend on this interface only — never on the data layer directly — so a
 * test can supply a plain object implementation without touching the
 * network. `getProductById` returns `ProductDetails`, not `Product`: the
 * details endpoint is a genuinely richer contract (brand, stock, discount,
 * a full image gallery), not just a single-item version of the list.
 * `getProductsByCategory` is paginated (`limit`/`skip`, same convention as
 * DummyJSON's own query params) and returns the page's `total` alongside
 * its products so a caller can tell when it has reached the last page.
 */
export interface ProductRepository {
  getProducts(signal?: AbortSignal): Promise<Product[]>;
  getProductById(id: string, signal?: AbortSignal): Promise<ProductDetails>;
  getProductsByCategory(
    categorySlug: string,
    limit: number,
    skip: number,
    signal?: AbortSignal,
  ): Promise<ProductsPage>;
}
