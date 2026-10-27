import { Product } from '../../domain/models/Product';
import { ProductDetails } from '../../domain/models/ProductDetails';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { ProductRemoteDataSource } from '../datasources/ProductRemoteDataSource';
import { mapProductDtoToProduct } from '../mappers/ProductMapper';
import { mapProductDetailsDtoToProductDetails } from '../mappers/ProductDetailsMapper';

/** Concrete `ProductRepository`: fetches DTOs and maps them to the domain models. */
export function createProductRepository(
  dataSource: ProductRemoteDataSource,
): ProductRepository {
  return {
    async getProducts(signal): Promise<Product[]> {
      const products = await dataSource.getProducts(signal);
      return products.map(mapProductDtoToProduct);
    },

    async getProductById(id, signal): Promise<ProductDetails> {
      const product = await dataSource.getProductById(id, signal);
      return mapProductDetailsDtoToProductDetails(product);
    },
  };
}
