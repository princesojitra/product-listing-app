import { AuthSession } from '../../domain/models/AuthSession';
import { AuthTokens } from '../../domain/models/AuthTokens';
import { AuthUser } from '../../domain/models/AuthUser';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthRemoteDataSource } from '../datasources/AuthRemoteDataSource';
import {
  mapCurrentUserResponseDtoToAuthUser,
  mapLoginResponseDtoToAuthSession,
  mapRefreshResponseDtoToAuthTokens,
} from '../mappers/AuthMapper';

/** Concrete `AuthRepository`: fetches DTOs and maps them to domain models. */
export function createAuthRepository(dataSource: AuthRemoteDataSource): AuthRepository {
  return {
    async login(username, password, signal): Promise<AuthSession> {
      const dto = await dataSource.login(username, password, signal);
      return mapLoginResponseDtoToAuthSession(dto);
    },

    async getCurrentUser(accessToken, signal): Promise<AuthUser> {
      const dto = await dataSource.getCurrentUser(accessToken, signal);
      return mapCurrentUserResponseDtoToAuthUser(dto);
    },

    async refresh(refreshToken, signal): Promise<AuthTokens> {
      const dto = await dataSource.refresh(refreshToken, signal);
      return mapRefreshResponseDtoToAuthTokens(dto);
    },
  };
}
