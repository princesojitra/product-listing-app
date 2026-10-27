import { Product } from '../models/Product';
import { ProductRepository } from '../repositories/ProductRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetProducts = (signal?: AbortSignal) => Promise<Product[]>;

export function createGetProducts(repository: ProductRepository): GetProducts {
  return signal => repository.getProducts(signal);
}
