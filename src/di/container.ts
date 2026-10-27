import { fetchHttpClient } from '../core/network/FetchHttpClient';
import {
  createProductRemoteDataSource,
  createProductRepository,
  createGetProducts,
  createGetProductDetails,
} from '../features/products';
import {
  createCategoryRemoteDataSource,
  createCategoryRepository,
  createGetCategories,
} from '../features/categories';

/**
 * Application composition root. Wires concrete implementations to the
 * interfaces/use cases the domain/presentation layers depend on, in
 * dependency order: HTTP client -> remote data source -> repository ->
 * use cases.
 *
 * Nothing outside this file should import the concrete data-layer pieces
 * (`FetchHttpClient`, `*RemoteDataSource`, `*RepositoryImpl`) directly —
 * consumers take the `Get*` use-case functions as parameters instead.
 */
const productRemoteDataSource = createProductRemoteDataSource(fetchHttpClient);
const productRepository = createProductRepository(productRemoteDataSource);

const categoryRemoteDataSource = createCategoryRemoteDataSource(fetchHttpClient);
const categoryRepository = createCategoryRepository(categoryRemoteDataSource);

export const container = {
  getProducts: createGetProducts(productRepository),
  getProductDetails: createGetProductDetails(productRepository),
  getCategories: createGetCategories(categoryRepository),
};
