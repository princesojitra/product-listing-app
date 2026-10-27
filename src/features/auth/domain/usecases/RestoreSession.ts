import { isAbortError } from '../../../../core/errors/isAbortError';
import { AuthSession } from '../models/AuthSession';
import { AuthRepository } from '../repositories/AuthRepository';
import { AuthSessionStorage } from '../repositories/AuthSessionStorage';
import { RefreshSession } from './RefreshSession';

export type RestoreSession = (signal?: AbortSignal) => Promise<AuthSession | null>;

/**
 * Validates a persisted session against `/auth/me`. If that fails (most
 * commonly an expired access token), refreshes the tokens once and retries
 * before giving up — matching the "retry an authenticated request at most
 * once after a successful refresh" policy. Returns `null` (and clears the
 * stored session) whenever restoration can't succeed, so the caller can
 * fall back to the signed-out state.
 */
export function createRestoreSession(
  repository: AuthRepository,
  sessionStorage: AuthSessionStorage,
  refreshSession: RefreshSession,
): RestoreSession {
  return async signal => {
    const stored = await sessionStorage.load();
    if (!stored) {
      return null;
    }

    try {
      const user = await repository.getCurrentUser(stored.accessToken, signal);
      return { ...stored, user };
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
    }

    try {
      const tokens = await refreshSession(stored.refreshToken, signal);
      const user = await repository.getCurrentUser(tokens.accessToken, signal);
      const refreshed: AuthSession = { ...tokens, user };
      await sessionStorage.save(refreshed);
      return refreshed;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      await sessionStorage.clear();
      return null;
    }
  };
}
