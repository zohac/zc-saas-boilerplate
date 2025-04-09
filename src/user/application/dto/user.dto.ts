// src/user/application/dto/user.dto.ts

import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object representing a user for client responses.
 * Excludes sensitive information like passwordHash.
 */
export class UserDto {
  @ApiProperty({
    description: 'User unique identifier (UUID)',
    example: 'a1b2c3d4-...',
  })
  id: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({ description: "User's first name", example: 'John' })
  givenName: string;

  @ApiProperty({ description: "User's last name", example: 'Doe' })
  familyName: string;

  @ApiProperty({
    description: "User's phone number",
    example: '+33612345678',
    required: false,
  })
  telephone: string | null;

  @ApiProperty({
    description: "URL of the user's profile image",
    required: false,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: true,
    required: false,
  })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp of user creation', required: false })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of last user update',
    required: false,
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Timestamp of last user login', required: false })
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
