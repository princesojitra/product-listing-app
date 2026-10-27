import { Category } from '../../domain/models/Category';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { CategoryRemoteDataSource } from '../datasources/CategoryRemoteDataSource';
import { mapCategoryDtoToCategory } from '../mappers/CategoryMapper';

/** Concrete `CategoryRepository`: fetches DTOs and maps them to the domain model. */
export function createCategoryRepository(
  dataSource: CategoryRemoteDataSource,
): CategoryRepository {
  return {
    async getCategories(signal): Promise<Category[]> {
      const categories = await dataSource.getCategories(signal);
      return categories.map(mapCategoryDtoToCategory);
    },
  };
}
