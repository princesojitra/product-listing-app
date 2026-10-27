import { AuthSession } from '../../domain/models/AuthSession';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthRemoteDataSource } from '../datasources/AuthRemoteDataSource';
import { mapLoginResponseDtoToAuthSession } from '../mappers/AuthMapper';

/** Concrete `AuthRepository`: fetches DTOs and maps them to the domain model. */
export function createAuthRepository(dataSource: AuthRemoteDataSource): AuthRepository {
  return {
    async login(username, password, signal): Promise<AuthSession> {
      const dto = await dataSource.login(username, password, signal);
      return mapLoginResponseDtoToAuthSession(dto);
    },
  };
}
