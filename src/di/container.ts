import { fetchHttpClient } from '../core/network/FetchHttpClient';
import {
  createProductRemoteDataSource,
  createProductRepository,
  createGetProducts,
  createGetProductDetails,
} from '../features/products';

/**
 * Application composition root. Wires concrete implementations to the
 * interfaces/use cases the domain/presentation layers depend on, in
 * dependency order: HTTP client -> remote data source -> repository ->
 * use cases.
 *
 * Nothing outside this file should import the concrete data-layer pieces
 * (`FetchHttpClient`, `ProductRemoteDataSource`, `ProductRepositoryImpl`)
 * directly — consumers take `GetProducts`/`GetProductDetails` as parameters
 * instead.
 */
const productRemoteDataSource = createProductRemoteDataSource(fetchHttpClient);
const productRepository = createProductRepository(productRemoteDataSource);

export const container = {
  getProducts: createGetProducts(productRepository),
  getProductDetails: createGetProductDetails(productRepository),
};
