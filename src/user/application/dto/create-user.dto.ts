// src/user/application/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

/**
 * Data Transfer Object for creating a new user.
 * Contains validation rules using class-validator decorators.
 */
export class CreateUserDto {
  @ApiProperty({
    description: "User's primary email address",
    example: 'john.doe@example.com',
    required: true, // Déjà défini par IsNotEmpty
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  email: string;

  @ApiProperty({
    description: "User's password (at least 8 characters)",
    example: 'Password123!',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password: string;

  @ApiProperty({
    description: "User's first name",
    example: 'John',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  givenName: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de famille ne peut pas être vide.' })
  familyName: string;

  @ApiProperty({
    description: "User's phone number (optional)",
    example: '+33612345678',
    required: false, // Indiqué par IsOptional
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'Le téléphone ne peut être une chaîne vide si fourni.',
  })
  telephone?: string | null;

  @ApiProperty({
    description: "URL of the user's profile picture (optional)",
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: "Veuillez fournir une URL valide pour l'image." })
  @IsNotEmpty({
    message: "L'URL de l'image ne peut être une chaîne vide si fournie.",
  })
  imageUrl?: string | null;
}
