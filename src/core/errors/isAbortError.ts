/** True for an error produced by an aborted `AbortController` signal. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
