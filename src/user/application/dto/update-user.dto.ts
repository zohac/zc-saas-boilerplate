// src/user/application/dto/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger'; // <-- Utiliser ApiPropertyOptional
import { IsNotEmpty, IsOptional, IsString, IsUrl, } from 'class-validator';

/**
 * Data Transfer Object for updating an existing user.
 * All fields are optional.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ // <-- Marquer comme optionnel dans Swagger
    description: "User's updated first name",
    example: 'Jane',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({message: 'Le prénom ne peut pas être une chaîne vide.'})
  givenName?: string;

  @ApiPropertyOptional({ // <-- Marquer comme optionnel
    description: "User's updated last name",
    example: 'Smith',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({message: 'Le nom de famille ne peut pas être une chaîne vide.'})
  familyName?: string;

  @ApiPropertyOptional({ // <-- Marquer comme optionnel
    description: "User's updated phone number",
    example: '+33712345678',
    nullable: true, // Indique que null est une valeur valide
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({message: 'Le téléphone ne peut être une chaîne vide si fourni.'})
    // @IsPhoneNumber('FR') // Si utilisé
  telephone?: string | null;

  @ApiPropertyOptional({ // <-- Marquer comme optionnel
    description: "URL of the user's updated profile picture",
    example: 'https://example.com/new_avatar.png',
    nullable: true, // Indique que null est une valeur valide
  })
  @IsOptional()
  @IsUrl({}, {message: "Veuillez fournir une URL valide pour l'image."})
  @IsNotEmpty({message: "L'URL de l'image ne peut être une chaîne vide si fournie."})
  imageUrl?: string | null;

  // Note: Email and password updates should typically have dedicated use cases/flows
  // for security and verification purposes, so they are excluded here.
  // isActive is also often managed by separate processes (admin, verification).
}
