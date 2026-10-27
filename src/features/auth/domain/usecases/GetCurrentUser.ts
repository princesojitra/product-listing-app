import { AuthUser } from '../models/AuthUser';
import { AuthRepository } from '../repositories/AuthRepository';

/** The narrow contract the presentation layer actually depends on. */
export type GetCurrentUser = (accessToken: string, signal?: AbortSignal) => Promise<AuthUser>;

export function createGetCurrentUser(repository: AuthRepository): GetCurrentUser {
  return (accessToken, signal) => repository.getCurrentUser(accessToken, signal);
}
