import { ProductDetails } from '../models/ProductDetails';
import { ProductRepository } from '../repositories/ProductRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetProductDetails = (
  id: string,
  signal?: AbortSignal,
) => Promise<ProductDetails>;

export function createGetProductDetails(
  repository: ProductRepository,
): GetProductDetails {
  return (id, signal) => repository.getProductById(id, signal);
}
