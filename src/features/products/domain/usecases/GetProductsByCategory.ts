import { Product } from '../models/Product';
import { ProductRepository } from '../repositories/ProductRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetProductsByCategory = (
  categorySlug: string,
  signal?: AbortSignal,
) => Promise<Product[]>;

export function createGetProductsByCategory(
  repository: ProductRepository,
): GetProductsByCategory {
  return (categorySlug, signal) => repository.getProductsByCategory(categorySlug, signal);
}
