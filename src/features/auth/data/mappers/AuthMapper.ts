import { AuthSession } from '../../domain/models/AuthSession';
import { AuthTokens } from '../../domain/models/AuthTokens';
import { AuthUser } from '../../domain/models/AuthUser';
import { CurrentUserResponseDto, LoginResponseDto, RefreshResponseDto } from '../dto/AuthDto';

export function mapCurrentUserResponseDtoToAuthUser(dto: CurrentUserResponseDto): AuthUser {
  return {
    id: String(dto.id),
    username: dto.username,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    imageUrl: dto.image,
  };
}

export function mapLoginResponseDtoToAuthSession(dto: LoginResponseDto): AuthSession {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    user: mapCurrentUserResponseDtoToAuthUser(dto),
  };
}

export function mapRefreshResponseDtoToAuthTokens(dto: RefreshResponseDto): AuthTokens {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
  };
}
