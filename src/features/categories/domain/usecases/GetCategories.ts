import { Category } from '../models/Category';
import { CategoryRepository } from '../repositories/CategoryRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetCategories = (signal?: AbortSignal) => Promise<Category[]>;

export function createGetCategories(repository: CategoryRepository): GetCategories {
  return signal => repository.getCategories(signal);
}
