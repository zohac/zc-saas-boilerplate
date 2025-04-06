// src/user/application/dto/user.dto.ts

/**
 * Data Transfer Object representing a user for client responses.
 * Excludes sensitive information like passwordHash.
 */
export class UserDto {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  telephone: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;

  // Constructeur statique ou mapper plus tard pour transformer User -> UserDto
  // static fromEntity(user: User): UserDto {
  //   const dto = new UserDto();
  //   dto.id = user.id;
  //   dto.email = user.email;
  //   // ... mapper les autres champs
  //   return dto;
  // }
}