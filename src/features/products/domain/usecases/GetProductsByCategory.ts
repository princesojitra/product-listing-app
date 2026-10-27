import { ProductsPage } from '../models/ProductsPage';
import { ProductRepository } from '../repositories/ProductRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetProductsByCategory = (
  categorySlug: string,
  limit: number,
  skip: number,
  signal?: AbortSignal,
) => Promise<ProductsPage>;

export function createGetProductsByCategory(
  repository: ProductRepository,
): GetProductsByCategory {
  return (categorySlug, limit, skip, signal) =>
    repository.getProductsByCategory(categorySlug, limit, skip, signal);
}
