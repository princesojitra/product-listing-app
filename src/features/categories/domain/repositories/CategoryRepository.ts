import { Category } from '../models/Category';

/**
 * Domain contract for loading categories. The presentation layer depends on
 * this interface only — never on the data layer directly — so a test can
 * supply a plain object implementation without touching the network.
 */
export interface CategoryRepository {
  getCategories(signal?: AbortSignal): Promise<Category[]>;
}
