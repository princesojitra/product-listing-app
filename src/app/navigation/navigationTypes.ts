/**
 * `ProductDetails`'s route params, shared across every stack that hosts it
 * (the Products tab's stack and the Categories tab's stack both navigate to
 * the same screen rather than duplicating it) — see `ProductDetailsScreen`,
 * which types its own props against this shape alone so it isn't tied to
 * one specific parent param list.
 */
export type ProductDetailsParams = { productId: string };

/**
 * Centralized route parameter list for the Products tab's nested stack
 * (list + details). The details route carries only the product's id — the
 * details screen fetches its own data from `/products/{id}` rather than
 * trusting whatever the previous screen happened to have in memory.
 */
export type RootStackParamList = {
  Products: undefined;
  ProductDetails: ProductDetailsParams;
};

/**
 * Centralized route parameter list for the Categories tab's nested stack
 * (list -> category products -> shared product details). Like
 * `ProductDetails`, `CategoryProducts` carries only the category's slug and
 * the minimal display info (its name, for the header title) needed to
 * avoid an extra round trip — never the full category or product list.
 */
export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryProducts: { categorySlug: string; categoryName: string };
  ProductDetails: ProductDetailsParams;
};

/** Top-level bottom-tab route list. Each tab owns its own nested navigator/screen. */
export type RootTabParamList = {
  Products: undefined;
  Categories: undefined;
};
