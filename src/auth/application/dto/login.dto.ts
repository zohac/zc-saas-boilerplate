// src/auth/application/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email for login',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  email: string;

  @ApiProperty({
    description: 'User password for login',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide.' })
  password: string;
}
