/** The user-profile fields shared by the login and `/auth/me` responses. */
interface UserFieldsDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

function hasValidUserFields(
  candidate: Record<string, unknown>,
): candidate is Record<string, unknown> & UserFieldsDto {
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.username === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.firstName === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.image === 'string'
  );
}

function hasValidTokens(
  candidate: Record<string, unknown>,
): candidate is { accessToken: string; refreshToken: string } {
  return (
    typeof candidate.accessToken === 'string' &&
    candidate.accessToken.length > 0 &&
    typeof candidate.refreshToken === 'string' &&
    candidate.refreshToken.length > 0
  );
}

/** Shape of DummyJSON's `POST /auth/login` response. */
export interface LoginResponseDto extends UserFieldsDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * Runtime guard for the login response. `fetch`/`JSON.parse` return
 * `unknown` data at the network boundary, so a type assertion alone would
 * let a malformed payload silently masquerade as valid tokens.
 */
export function isLoginResponseDto(value: unknown): value is LoginResponseDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return hasValidUserFields(candidate) && hasValidTokens(candidate);
}

/**
 * Shape of DummyJSON's `GET /auth/me` response — a much larger profile
 * object in practice (address, bank details, even the plaintext test
 * password); only the fields this app actually uses are validated/kept.
 */
export type CurrentUserResponseDto = UserFieldsDto;

export function isCurrentUserResponseDto(value: unknown): value is CurrentUserResponseDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return hasValidUserFields(value as Record<string, unknown>);
}

/** Shape of DummyJSON's `POST /auth/refresh` response — tokens only, no profile. */
export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export function isRefreshResponseDto(value: unknown): value is RefreshResponseDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return hasValidTokens(value as Record<string, unknown>);
}
