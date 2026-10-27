import { AuthSession } from '../../domain/models/AuthSession';
import { LoginResponseDto } from '../dto/AuthDto';

export function mapLoginResponseDtoToAuthSession(dto: LoginResponseDto): AuthSession {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    user: {
      id: String(dto.id),
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      imageUrl: dto.image,
    },
  };
}
