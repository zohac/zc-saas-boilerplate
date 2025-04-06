// src/user/application/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength, } from 'class-validator';

/**
 * Data Transfer Object for creating a new user.
 * Contains validation rules using class-validator decorators.
 */
export class CreateUserDto {
  @IsEmail({}, {message: 'Veuillez fournir une adresse email valide.'})
  @IsNotEmpty({message: "L'email ne peut pas être vide."})
  email: string;

  @IsString()
  @IsNotEmpty({message: 'Le mot de passe ne peut pas être vide.'})
  @MinLength(8, {message: 'Le mot de passe doit contenir au moins 8 caractères.'})
    // Ajoutez d'autres validateurs de mot de passe si nécessaire (ex: @Matches)
  password: string;

  @IsString()
  @IsNotEmpty({message: 'Le prénom ne peut pas être vide.'})
  givenName: string;

  @IsString()
  @IsNotEmpty({message: 'Le nom de famille ne peut pas être vide.'})
  familyName: string;

  @IsOptional()
  @IsString() // Utilisez @IsPhoneNumber('FR') par exemple pour une validation plus stricte
  @IsNotEmpty({message: 'Le téléphone ne peut être une chaîne vide si fourni.'})
  telephone?: string | null; // Note: class-transformer peut aider à gérer null/undefined

  @IsOptional()
  @IsUrl({}, {message: 'Veuillez fournir une URL valide pour l\'image.'})
  @IsNotEmpty({message: 'L\'URL de l\'image ne peut être une chaîne vide si fournie.'})
  imageUrl?: string | null;
}