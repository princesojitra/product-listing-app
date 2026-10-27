import { AuthSession } from '../models/AuthSession';
import { AuthTokens } from '../models/AuthTokens';
import { AuthUser } from '../models/AuthUser';

export interface AuthRepository {
  login(username: string, password: string, signal?: AbortSignal): Promise<AuthSession>;
  getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<AuthUser>;
  refresh(refreshToken: string, signal?: AbortSignal): Promise<AuthTokens>;
}
