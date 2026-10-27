import { AuthTokens } from '../models/AuthTokens';
import { AuthRepository } from '../repositories/AuthRepository';

export type RefreshSession = (refreshToken: string, signal?: AbortSignal) => Promise<AuthTokens>;

/**
 * Wraps the repository call so that concurrent callers (e.g. a restore and a
 * retried request both hitting an expired token around the same time) share
 * one in-flight `/auth/refresh` call instead of each firing their own.
 */
export function createRefreshSession(repository: AuthRepository): RefreshSession {
  let inFlight: Promise<AuthTokens> | null = null;

  return (refreshToken, signal) => {
    if (!inFlight) {
      // shortcut: once a refresh is in flight, a joiner's own abort signal is
      // ignored in favor of the first caller's; fine since refresh is a
      // single short-lived request, not worth per-caller cancellation.
      inFlight = repository.refresh(refreshToken, signal).finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  };
}
