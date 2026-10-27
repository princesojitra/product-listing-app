import { AuthSession } from '../models/AuthSession';
import { AuthRepository } from '../repositories/AuthRepository';

/** The narrow contract the presentation layer actually depends on. */
export type Login = (
  username: string,
  password: string,
  signal?: AbortSignal,
) => Promise<AuthSession>;

export function createLogin(repository: AuthRepository): Login {
  return (username, password, signal) => repository.login(username, password, signal);
}
