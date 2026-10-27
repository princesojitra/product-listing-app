import * as Keychain from 'react-native-keychain';
import { AuthSession } from '../../domain/models/AuthSession';
import { AuthSessionStorage } from '../../domain/repositories/AuthSessionStorage';

/** Scopes the Keychain entry to this app/feature, distinct from any other credential it might store. */
const SERVICE = 'com.productlistingapp.session';

function isStoredSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null
  );
}

/** Persists the session to the platform Keychain/Keystore — never AsyncStorage or logs. */
export function createSecureSessionStorage(): AuthSessionStorage {
  return {
    async save(session) {
      await Keychain.setGenericPassword(session.user.username, JSON.stringify(session), {
        service: SERVICE,
      });
    },

    async load() {
      const credentials = await Keychain.getGenericPassword({ service: SERVICE });
      if (!credentials) {
        return null;
      }
      try {
        const parsed: unknown = JSON.parse(credentials.password);
        return isStoredSession(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async clear() {
      await Keychain.resetGenericPassword({ service: SERVICE });
    },
  };
}
