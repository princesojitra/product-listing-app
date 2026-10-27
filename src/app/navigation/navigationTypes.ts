/**
 * Centralized route parameter list for the nested Products stack (list +
 * details). The details route carries only the product's id — the details
 * screen fetches its own data from `/products/{id}` rather than trusting
 * whatever the previous screen happened to have in memory.
 */
export type RootStackParamList = {
  Products: undefined;
  ProductDetails: { productId: string };
};

/** Top-level bottom-tab route list. Each tab owns its own nested navigator/screen. */
export type RootTabParamList = {
  Products: undefined;
  Categories: undefined;
};
