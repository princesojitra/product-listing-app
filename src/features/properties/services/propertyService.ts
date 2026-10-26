import { Property, RawPost, isRawPost } from '../types/property';

const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10';

// Deterministic mock data generators. JSONPlaceholder returns blog posts,
// not real estate listings, so we derive plausible-looking (but fake)
// location/price/bedroom values from each post's id. NONE of this is real
// listing data.
const MOCK_LOCATIONS = [
  'Downtown, Dubai Marina',
  'Palm Jumeirah',
  'Business Bay',
  'Jumeirah Village Circle',
  'Arabian Ranches',
  'Al Barsha',
  'Dubai International Financial Centre',
  'Jumeirah Beach Residence',
  'Dubai Hills Estate',
  'Mirdif',
];

function mockLocationFor(id: number): string {
  return MOCK_LOCATIONS[id % MOCK_LOCATIONS.length];
}

function mockPriceFor(id: number): number {
  return 500_000 + (id % 20) * 125_000;
}

function mockBedroomsFor(id: number): number {
  return 1 + (id % 5);
}

function mockImageUrlFor(id: number): string {
  return `https://picsum.photos/seed/property-${id}/600/400`;
}

function mapPostToProperty(post: RawPost): Property {
  return {
    id: String(post.id),
    title: post.title,
    location: mockLocationFor(post.id),
    price: mockPriceFor(post.id),
    bedrooms: mockBedroomsFor(post.id),
    imageUrl: mockImageUrlFor(post.id),
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Fetches the sample property list. Rejects with the original abort error
 * (name === 'AbortError') on cancellation so callers can distinguish a
 * cancelled request from a genuine failure; never silently returns an
 * empty list when the request actually failed.
 */
export async function getProperties(signal?: AbortSignal): Promise<Property[]> {
  let response: Response;
  try {
    response = await fetch(API_URL, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new Error(
      'Could not reach the server. Please check your connection and try again.',
    );
  }

  // fetch() only rejects on network failure — an HTTP error status like
  // 404 or 500 still resolves successfully, so response.ok must be checked
  // explicitly.
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned a response that could not be read.');
  }

  if (!Array.isArray(data)) {
    throw new Error('The server returned an unexpected response format.');
  }

  const validPosts = data.filter(isRawPost);

  if (validPosts.length === 0 && data.length > 0) {
    throw new Error('The server response did not contain any valid properties.');
  }

  return validPosts.map(mapPostToProperty);
}
