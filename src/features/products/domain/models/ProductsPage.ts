import { Product } from './Product';

/** One page of a paginated product list, plus the total number of matches. */
export interface ProductsPage {
  products: Product[];
  total: number;
}
