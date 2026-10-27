import { AuthSessionStorage } from '../repositories/AuthSessionStorage';

export type Logout = () => Promise<void>;

/** DummyJSON has no server-side session to invalidate; logging out is purely local. */
export function createLogout(sessionStorage: AuthSessionStorage): Logout {
  return () => sessionStorage.clear();
}
