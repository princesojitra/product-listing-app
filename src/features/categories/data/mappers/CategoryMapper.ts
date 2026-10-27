import { Category } from '../../domain/models/Category';
import { CategoryDto } from '../dto/CategoryDto';

/**
 * `url` is just the category-products endpoint URL, which Milestone 3
 * constructs itself from `slug` rather than trusting a server-provided
 * link, so it's intentionally not carried into the domain model.
 */
export function mapCategoryDtoToCategory(dto: CategoryDto): Category {
  return {
    slug: dto.slug,
    name: dto.name,
  };
}
