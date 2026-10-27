/**
 * Centralized route parameter list for the root stack. The details route
 * carries only the product's id — the details screen fetches its own data
 * from `/products/{id}` rather than trusting whatever the previous screen
 * happened to have in memory.
 */
export type RootStackParamList = {
  Products: undefined;
  ProductDetails: { productId: string };
};
