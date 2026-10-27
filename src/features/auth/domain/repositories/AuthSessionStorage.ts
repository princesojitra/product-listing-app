import { AuthSession } from '../models/AuthSession';

/** Persists the session across app launches (e.g. the platform Keychain/Keystore). */
export interface AuthSessionStorage {
  save(session: AuthSession): Promise<void>;
  load(): Promise<AuthSession | null>;
  clear(): Promise<void>;
}
