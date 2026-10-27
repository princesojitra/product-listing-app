/**
 * Thin, replaceable abstraction over the networking primitive the app uses.
 * Lets the data layer depend on an interface instead of the global `fetch`,
 * so a test can supply a mock implementation.
 */
export interface HttpClient {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}
