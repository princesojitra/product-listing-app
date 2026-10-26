/**
 * Domain/UI model used throughout the app. Decoupled from the external
 * API's response shape so that API changes don't ripple into the UI.
 */
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  imageUrl: string;
}

/**
 * Shape of a single item returned by JSONPlaceholder's /posts endpoint.
 * This is NOT a real estate API — see propertyService for the mock
 * transformation into `Property`.
 */
export interface RawPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type RawPostsResponse = RawPost[];

/**
 * Runtime guard for a single raw post. `fetch`/`JSON.parse` return `unknown`
 * data at the network boundary, so a type assertion alone would let a
 * malformed payload silently masquerade as a valid `RawPost`.
 */
export function isRawPost(value: unknown): value is RawPost {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0
  );
}
