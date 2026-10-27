import { AuthUser } from './AuthUser';

/** Tokens plus the profile they were issued for; the unit persisted across app launches. */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
