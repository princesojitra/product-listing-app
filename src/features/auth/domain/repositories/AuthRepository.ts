import { AuthSession } from '../models/AuthSession';

export interface AuthRepository {
  login(username: string, password: string, signal?: AbortSignal): Promise<AuthSession>;
}
