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
    sku: dto.sku,
    weight: dto.weight,
    dimensions: dto.dimensions,
    warrantyInformation: dto.warrantyInformation,
    shippingInformation: dto.shippingInformation,
    stock: dto.stock,
    availabilityStatus: dto.availabilityStatus,
    returnPolicy: dto.returnPolicy,
    minimumOrderQuantity: dto.minimumOrderQuantity,
    tags: dto.tags,
    reviews: dto.reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      reviewerName: review.reviewerName,
    })),
    imageUrl: dto.images[0] ?? dto.thumbnail,
    images: dto.images.length > 0 ? dto.images : [dto.thumbnail],
  };
}
