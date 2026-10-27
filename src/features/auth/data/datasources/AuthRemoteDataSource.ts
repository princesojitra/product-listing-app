import { HttpClient } from '../../../../core/network/HttpClient';
import { isAbortError } from '../../../../core/errors/isAbortError';
import {
  CurrentUserResponseDto,
  isCurrentUserResponseDto,
  isLoginResponseDto,
  isRefreshResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from '../dto/AuthDto';

const AUTH_URL = 'https://dummyjson.com/auth';

/** Talks HTTP and validates the DummyJSON response shape; returns raw DTOs. */
export interface AuthRemoteDataSource {
  login(username: string, password: string, signal?: AbortSignal): Promise<LoginResponseDto>;
  getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<CurrentUserResponseDto>;
  refresh(refreshToken: string, signal?: AbortSignal): Promise<RefreshResponseDto>;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error('The server returned a response that could not be read.');
  }
}

export function createAuthRemoteDataSource(httpClient: HttpClient): AuthRemoteDataSource {
  return {
    async login(username, password, signal) {
      let response: Response;
      try {
        response = await httpClient.fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, expiresInMins: 30 }),
          signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        throw new Error(
          'Could not reach the server. Please check your connection and try again.',
        );
      }

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          throw new Error('Invalid username or password.');
        }
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = await readJsonResponse(response);

      if (!isLoginResponseDto(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      return data;
    },

    async getCurrentUser(accessToken, signal) {
      let response: Response;
      try {
        response = await httpClient.fetch(`${AUTH_URL}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        throw new Error(
          'Could not reach the server. Please check your connection and try again.',
        );
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = await readJsonResponse(response);

      if (!isCurrentUserResponseDto(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      return data;
    },

    async refresh(refreshToken, signal) {
      let response: Response;
      try {
        response = await httpClient.fetch(`${AUTH_URL}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
          signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        throw new Error(
          'Could not reach the server. Please check your connection and try again.',
        );
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = await readJsonResponse(response);

      if (!isRefreshResponseDto(data)) {
        throw new Error('The server returned an unexpected response format.');
      }

      return data;
    },
  };
}
