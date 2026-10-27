import { ProductDetails } from '../../domain/models/ProductDetails';
import { ProductDetailsDto } from '../dto/ProductDetailsDto';

export function mapProductDetailsDtoToProductDetails(
  dto: ProductDetailsDto,
): ProductDetails {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    category: dto.category,
    price: dto.price,
    discountPercentage: dto.discountPercentage,
    rating: dto.rating,
    brand: dto.brand ?? null,
    stock: dto.stock,
    availabilityStatus: dto.availabilityStatus,
    tags: dto.tags,
    imageUrl: dto.images[0] ?? dto.thumbnail,
    images: dto.images,
  };
}
