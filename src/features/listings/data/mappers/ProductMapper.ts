import { Listing } from '../../domain/models/Listing';
import { ProductDto } from '../dto/ProductDto';

export function mapProductDtoToListing(dto: ProductDto): Listing {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    price: dto.price,
    category: dto.category,
    rating: dto.rating,
    imageUrl: dto.thumbnail,
  };
}
