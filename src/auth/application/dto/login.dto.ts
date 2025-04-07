// src/auth/application/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, {message: 'Veuillez fournir une adresse email valide.'})
  @IsNotEmpty({message: "L'email ne peut pas être vide."})
  email: string;

  @IsString()
  @IsNotEmpty({message: 'Le mot de passe ne peut pas être vide.'})
    // Pas de MinLength ici, on valide juste la présence pour le login
  password: string;
}
