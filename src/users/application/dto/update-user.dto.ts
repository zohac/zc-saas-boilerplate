// src/user/application/dto/update-user.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUrl, } from 'class-validator';

/**
 * Data Transfer Object for updating an existing user.
 * All fields are optional.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({message: 'Le prénom ne peut pas être une chaîne vide.'})
  givenName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({message: 'Le nom de famille ne peut pas être une chaîne vide.'})
  familyName?: string;

  @IsOptional()
  @IsString() // Utilisez @IsPhoneNumber('FR') par exemple pour une validation plus stricte
  @IsNotEmpty({message: 'Le téléphone ne peut être une chaîne vide si fourni.'})
  telephone?: string | null;

  @IsOptional()
  @IsUrl({}, {message: 'Veuillez fournir une URL valide pour l\'image.'})
  @IsNotEmpty({message: 'L\'URL de l\'image ne peut être une chaîne vide si fournie.'})
  imageUrl?: string | null;

  // Note: Email and password updates should typically have dedicated use cases/flows
  // for security and verification purposes, so they are excluded here.
  // isActive is also often managed by separate processes (admin, verification).
}