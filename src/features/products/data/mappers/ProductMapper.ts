import { Product } from '../../domain/models/Product';
import { ProductDto } from '../dto/ProductDto';

/** Also used for `ProductDetailsDto`, which validates to the same shape. */
export function mapProductDtoToProduct(dto: ProductDto): Product {
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
